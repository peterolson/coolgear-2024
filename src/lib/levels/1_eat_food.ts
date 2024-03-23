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
	pieces.push({
		id: r.nextUUID(),
		owner: 'human',
		type: 'Man',
		...humanCoord,
		memory: {}
	});

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
				type: 'Food',
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
// Complete the 'nextMove' below to tell your character what to do.

function nextMove(self : Piece) : Move {
    // Your code goes here
    return {
        dx: 1,
        dy: 0,
        action: 'move'
    };
}`;
