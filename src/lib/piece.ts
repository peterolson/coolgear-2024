import type { Coord } from './world';

export type PieceType = 'human' | 'food';
export type Gender = 'male' | 'female' | undefined;

export type World = {
	pieces: Piece[];
	size: number;
	moveCount: number;
};

export class Piece {
	id: string;
	owner: string;
	type: PieceType;
	gender: Gender;
	x: number;
	y: number;
	world: World;
	hitpoints: number;
	maxHitpoints: number;
	attack: number;

	constructor(obj: {
		id: string;
		owner: string;
		type: PieceType;
		gender: Gender;
		x: number;
		y: number;
		world: World;
		hitpoints?: number;
		maxHitpoints?: number;
		attack?: number;
	}) {
		this.id = obj.id;
		this.owner = obj.owner;
		this.type = obj.type;
		this.gender = obj.gender;
		this.x = obj.x;
		this.y = obj.y;
		this.world = obj.world;
		this.hitpoints = obj.hitpoints ?? 10;
		this.maxHitpoints = obj.maxHitpoints ?? 10;
		this.attack = obj.attack ?? 3;
	}

	toJSON() {
		return {
			id: this.id,
			owner: this.owner,
			type: this.type,
			gender: this.gender,
			x: this.x,
			y: this.y,
			hitpoints: this.hitpoints,
			maxHitpoints: this.maxHitpoints,
			attack: this.attack
		};
	}

	clone() {
		return new Piece({ ...this.toJSON(), world: this.world });
	}

	static distance(a: Piece | Coord, b: Piece | Coord) {
		return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
	}

	distanceTo(piece: Piece | Coord) {
		return Piece.distance(this, piece);
	}

	findClosestPiece() {
		let minDistance = Infinity;
		let closestPiece: Piece | null = null;
		for (const piece of this.world.pieces) {
			if (piece.id === this.id) continue;
			const distance = this.distanceTo(piece);
			if (distance < minDistance) {
				minDistance = distance;
				closestPiece = piece;
			}
		}
		return closestPiece;
	}

	findClosestPieces(n: number) {
		const pieces = this.world.pieces.filter((p) => p.id !== this.id);
		pieces.sort((a, b) => this.distanceTo(a) - this.distanceTo(b));
		return pieces.slice(0, n);
	}

	isAdjacentTo(piece: Piece | Coord) {
		return this.distanceTo(piece) === 1;
	}

	getEmptyAdjacentCoords(): Coord[] {
		const coords: Coord[] = [];
		for (const dx of [0, 1, -1]) {
			for (const dy of [0, 1, -1]) {
				if (dx === 0 && dy === 0) {
					continue;
				}
				const x = this.x + dx;
				const y = this.y + dy;
				if (x < 0 || x >= this.world.size || y < 0 || y >= this.world.size) {
					continue;
				}
				const otherPieces = this.world.pieces.filter((p) => p.id !== this.id);
				if (otherPieces.some((p) => p.x === x && p.y === y)) {
					continue;
				}
				coords.push({ x, y });
			}
		}
		return coords;
	}

	availableMoves() {
		const emptyAdjacentCoords = this.getEmptyAdjacentCoords();
		const moves: Move[] = [];
		for (const { x, y } of emptyAdjacentCoords) {
			moves.push({
				dx: (x - this.x) as -1 | 0 | 1,
				dy: (y - this.y) as -1 | 0 | 1,
				action: 'move'
			});
		}
		return moves;
	}

	moveTowards(piece: Piece | Coord, action: Action, secondaryDestination?: Piece | Coord): Move {
		if (this.isAdjacentTo(piece)) {
			return { dx: (piece.x - this.x) as 0, dy: (piece.y - this.y) as 0, action };
		}
		const moves = this.availableMoves();
		let minDistance = Infinity;
		let bestMove: Move = { dx: 0, dy: 0, action: 'move' };
		for (const move of moves) {
			const x = this.x + move.dx;
			const y = this.y + move.dy;
			const distance = Piece.distance({ x, y }, piece);
			if (distance < minDistance) {
				minDistance = distance;
				bestMove = move;
			}
		}
		if (secondaryDestination) {
			let minSecondaryDistance = Infinity;
			for (const move of moves) {
				const x = this.x + move.dx;
				const y = this.y + move.dy;
				const distance = Piece.distance({ x, y }, piece);
				if (distance > minDistance) continue;
				const secondaryDistance = Piece.distance({ x, y }, secondaryDestination);
				if (secondaryDistance < minSecondaryDistance) {
					minSecondaryDistance = secondaryDistance;
					bestMove = move;
				}
			}
		}
		return bestMove;
	}
}

export type Action = 'move' | 'eat' | 'reproduce';

export type Move = {
	dx: -1 | 0 | 1;
	dy: -1 | 0 | 1;
	action: Action;
};
