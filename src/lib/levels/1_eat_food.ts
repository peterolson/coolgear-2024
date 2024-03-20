import { RandomNumberGenerator } from '$lib/random';
import type { Piece, WorldGenerator } from '$lib/world.types';

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
		pieces.push({
			id: r.nextUUID(),
			owner: 'map',
			type: 'Food',
			...coord,
			memory: {}
		});
	}

	return { size, pieces };
};
