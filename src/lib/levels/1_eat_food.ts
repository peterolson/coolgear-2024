import { RandomNumberGenerator } from '$lib/random';
import { World, type WorldGenerator } from '$lib/world';
import { Piece } from '$lib/piece';

export const generator: WorldGenerator = (seed) => {
	const r = new RandomNumberGenerator(seed);
	const size = 20;
	const pieces: Piece[] = [];

	const occupiedCoords = new Set<string>();

	const humanCoord = r.nextCoordinate(size);
	occupiedCoords.add(`${humanCoord.x},${humanCoord.y}`);
	pieces.push(
		new Piece({
			id: r.nextUUID(),
			owner: 'human',
			type: 'human',
			gender: 'male',
			...humanCoord,
			memory: {}
		})
	);

	while (pieces.length < 20) {
		const coord = r.nextCoordinate(size);
		const coordKey = `${coord.x},${coord.y}`;
		if (occupiedCoords.has(coordKey)) {
			continue;
		}
		occupiedCoords.add(coordKey);
		pieces.push(
			new Piece({
				id: r.nextUUID(),
				owner: 'map',
				type: 'food',
				gender: r.nextArrayElement(['male', 'female']),
				...coord,
				memory: {}
			})
		);
	}

	return new World({
		size,
		pieces,
		randomSeed: seed
	});
};

export const defaultCode = `// *** Level 1: Eat Food *** //

// The goal of this level is to eat all the food on the map.
// Complete the 'nextMove' function below to tell your character what to do.

// The 'nextMove' function takes two arguments:
// - 'self' is your character, a Piece object with the following properties:
//   - x, y: your character's current position
//   - memory: an object where you can store any information persisted between turns
// - 'visiblePieces' is an array of Piece objects that your character can see
//    your character can see pieces that are within 3 squares of it in any direction
// The 'nextMove' function should return a Move object with the following properties:
// - dx, dy: the change in the x and y directions
//   - dx should be 0, 1, or -1
//   - dy should be 0, 1, or -1
// - action: a string indicating what to do, either 'move' or 'eat'

function nextMove(self : Piece, visiblePieces : Piece[]) : Move {
    // Your code goes here
    return {
        dx: 1,
        dy: 0,
        action: 'move'
    };
}`;
