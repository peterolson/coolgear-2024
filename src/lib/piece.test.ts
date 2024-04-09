import { expect, test } from 'vitest';
import { Piece } from './piece';
import { World } from './world';

test('distance between two pieces', () => {
	const world = new World({
		size: 4,
		pieces: [],
		randomSeed: '1',
		victoryCondition: () => false
	});
	function generatePiece(x: number, y: number) {
		return new Piece({
			id: '1',
			owner: '1',
			type: 'human',
			x,
			y,
			gender: 'male',
			world
		});
	}
	const p0_0 = generatePiece(0, 0);
	const p0_1 = generatePiece(0, 1);
	const p0_2 = generatePiece(0, 2);
	const p0_3 = generatePiece(0, 3);
	const p1_0 = generatePiece(1, 0);
	const p1_1 = generatePiece(1, 1);
	const p1_2 = generatePiece(1, 2);
	const p1_3 = generatePiece(1, 3);
	const p2_0 = generatePiece(2, 0);
	const p2_1 = generatePiece(2, 1);
	const p2_2 = generatePiece(2, 2);
	const p2_3 = generatePiece(2, 3);
	const p3_0 = generatePiece(3, 0);
	const p3_1 = generatePiece(3, 1);
	const p3_2 = generatePiece(3, 2);
	const p3_3 = generatePiece(3, 3);

	expect(p0_0.distanceTo(p0_0)).toBe(0);
	expect(p0_0.distanceTo(p0_1)).toBe(1);
	expect(p0_0.distanceTo(p0_2)).toBe(2);
	expect(p0_0.distanceTo(p0_3)).toBe(1);
	expect(p0_0.distanceTo(p1_0)).toBe(1);
	expect(p0_0.distanceTo(p1_1)).toBe(1);
	expect(p0_0.distanceTo(p1_2)).toBe(2);
	expect(p0_0.distanceTo(p1_3)).toBe(1);
	expect(p0_0.distanceTo(p2_0)).toBe(2);
	expect(p0_0.distanceTo(p2_1)).toBe(2);
	expect(p0_0.distanceTo(p2_2)).toBe(2);
	expect(p0_0.distanceTo(p2_3)).toBe(2);
	expect(p0_0.distanceTo(p3_0)).toBe(1);
	expect(p0_0.distanceTo(p3_1)).toBe(1);
	expect(p0_0.distanceTo(p3_2)).toBe(2);
	expect(p0_0.distanceTo(p3_3)).toBe(1);

	expect(p1_1.distanceTo(p0_0)).toBe(1);
	expect(p1_1.distanceTo(p0_1)).toBe(1);
	expect(p1_1.distanceTo(p0_2)).toBe(1);
	expect(p1_1.distanceTo(p0_3)).toBe(2);
	expect(p1_1.distanceTo(p1_0)).toBe(1);
	expect(p1_1.distanceTo(p1_1)).toBe(0);
	expect(p1_1.distanceTo(p1_2)).toBe(1);
	expect(p1_1.distanceTo(p1_3)).toBe(2);
	expect(p1_1.distanceTo(p2_0)).toBe(1);
	expect(p1_1.distanceTo(p2_1)).toBe(1);
	expect(p1_1.distanceTo(p2_2)).toBe(1);
	expect(p1_1.distanceTo(p2_3)).toBe(2);
	expect(p1_1.distanceTo(p3_0)).toBe(2);
	expect(p1_1.distanceTo(p3_1)).toBe(2);
	expect(p1_1.distanceTo(p3_2)).toBe(2);
	expect(p1_1.distanceTo(p3_3)).toBe(2);
});
