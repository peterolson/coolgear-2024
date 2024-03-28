import { RandomNumberGenerator } from '$lib/random';
import { World, type WorldGenerator, type WorldScoring } from '$lib/world';
import { Piece } from '$lib/piece';

export const generator: WorldGenerator = (seed, user) => {
	const r = new RandomNumberGenerator(seed);
	const size = 20;

	const world = new World({
		size,
		pieces: [],
		randomSeed: seed,
		victoryCondition: (w) => w.pieces.filter((p) => p.type === 'food').length === 0
	});

	const occupiedCoords = new Set<string>();

	const humanCoord = r.nextCoordinate(size);
	occupiedCoords.add(`${humanCoord.x},${humanCoord.y}`);
	world.pieces.push(
		new Piece({
			id: r.nextUUID(),
			owner: user,
			type: 'human',
			gender: 'male',
			...humanCoord,
			memory: {},
			world
		})
	);

	while (world.pieces.length < 20) {
		const coord = r.nextCoordinate(size);
		const coordKey = `${coord.x},${coord.y}`;
		if (occupiedCoords.has(coordKey)) {
			continue;
		}
		occupiedCoords.add(coordKey);
		world.pieces.push(
			new Piece({
				id: r.nextUUID(),
				owner: 'map',
				type: 'food',
				gender: r.nextArrayElement(['male', 'female']),
				...coord,
				memory: {},
				world
			})
		);
	}

	return world;
};

export const defaultCode = `
// The goal of this level is to eat all the food on the map.
// Complete the 'nextMove' function below to tell your character what to do.

function nextMove(self : Piece, world: World) : Move {
    // Your code goes here
    return {
        dx: 1,
        dy: 0,
        action: 'move'
    };
}`;

export const name = 'Eat Food';
export const id = 'eat-food';

export const scoring: WorldScoring = {
	title: '# of steps',
	evaluator: (world: World) => world.moveCount,
	highestBest: false
};
