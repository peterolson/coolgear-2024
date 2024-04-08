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
		victoryCondition: (w) => w.pieces.filter((p) => p.owner === 'enemy').length === 0,
		lossCondition: (w) => w.pieces.filter((p) => p.owner === user).length === 0,
		betweenSteps: (w) => {
			// ensure that there are always 15 food items on the map
			while (w.pieces.filter((p) => p.type === 'food').length < 15) {
				const coord = r.nextCoordinate(size);
				if (w.pieces.find((p) => p.x === coord.x && p.y === coord.y)) {
					continue;
				}
				w.pieces.push(
					new Piece({
						id: r.nextUUID(),
						owner: 'map',
						type: 'food',
						gender: r.nextArrayElement(['male', 'female']),
						...coord,
						world
					})
				);
			}
		}
	});

	const occupiedCoords = new Set<string>();

	const bossCoord = r.nextCoordinate(size);
	occupiedCoords.add(`${bossCoord.x},${bossCoord.y}`);
	world.pieces.push(
		new Piece({
			id: r.nextUUID(),
			owner: 'enemy',
			type: 'human',
			gender: 'male',
			...bossCoord,
			hitpoints: 50,
			maxHitpoints: 50,
			attack: 10,
			world
		})
	);

	while (world.pieces.length < 5) {
		const coord = r.nextCoordinate(size);
		const coordKey = `${coord.x},${coord.y}`;
		if (occupiedCoords.has(coordKey)) {
			continue;
		}
		occupiedCoords.add(coordKey);
		world.pieces.push(
			new Piece({
				id: r.nextUUID(),
				owner: user,
				type: 'human',
				gender: 'male',
				...coord,
				world,
				hitpoints: 10,
				maxHitpoints: 10,
				attack: 3
			})
		);
	}

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
				world
			})
		);
	}

	const enemyStrategy = function nextMove(
		self: Piece,
		world: World,
		r: RandomNumberGenerator
	): Move {
		const closestHuman = self.findClosestPiece({ owner: '__USER__' });
		if (!closestHuman) return { dx: 0, dy: 0, action: 'move' };
		const closestFood = self.findClosestPiece({ type: 'food' });
		if (closestFood && self.isAdjacentTo(closestFood)) {
			return self.moveTowards(closestFood, 'eat');
		}
		return self.moveTowards(closestHuman, 'attack');
	};

	const enemyCode = enemyStrategy.toString().replaceAll('__USER__', user);
	world.setCode('enemy', enemyCode);

	return world;
};

export const defaultCode = `
// The goal of this level is to kill the red human on the map.

function nextMove(self : Piece, world: World, r: RandomNumberGenerator) : Move {
    // Your code goes here
    return {
        dx: 1,
        dy: 0,
        action: 'move'
    };
}`;

export const name = 'Kill the boss';
export const id = 'kill-boss';

export const scoring: WorldScoring = {
	title: '# of steps',
	evaluator: (world: World) => world.moveCount,
	highestBest: false
};
