import type { Coord } from './world';

export type PieceType = 'human' | 'food';
export type Gender = 'male' | 'female' | undefined;

export type World = {
	pieces: Piece[];
	size: number;
	moveCount: number;
	r: RandomNumberGenerator;
};

export type PieceFilters =
	| {
			owner?: string;
			type?: PieceType;
			gender?: Gender;
	  }
	| ((piece: Piece) => boolean);

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

	static distance(a: Piece | Coord, b: Piece | Coord, world?: World) {
		if (a instanceof Piece) {
			world = a.world;
		} else if (b instanceof Piece) {
			world = b.world;
		}
		if (!world) {
			throw new Error('If both a and b are Coord objects, world must be provided');
		}
		const xDistance = Math.min(Math.abs(a.x - b.x), world.size - Math.abs(a.x - b.x));
		const yDistance = Math.min(Math.abs(a.y - b.y), world.size - Math.abs(a.y - b.y));
		return Math.max(xDistance, yDistance);
	}

	static filter(pieces: Piece[], filters?: PieceFilters) {
		if (!filters) return pieces;
		if (typeof filters === 'function') {
			return pieces.filter(filters);
		}
		return pieces.filter((p) => {
			if (filters.owner && p.owner !== filters.owner) {
				return false;
			}
			if (filters.type && p.type !== filters.type) {
				return false;
			}
			if (filters.gender && p.gender !== filters.gender) {
				return false;
			}
			return true;
		});
	}

	distanceTo(piece: Piece | Coord) {
		return Piece.distance(this, piece);
	}

	findClosestPiece(filters?: PieceFilters) {
		let minDistance = Infinity;
		let closestPiece: Piece | null = null;
		for (const piece of Piece.filter(this.world.pieces, filters)) {
			if (piece.id === this.id) continue;
			const distance = this.distanceTo(piece);
			if (distance < minDistance) {
				minDistance = distance;
				closestPiece = piece;
			}
		}
		return closestPiece;
	}

	findClosestPieces(n: number, filters?: PieceFilters) {
		const pieces = Piece.filter(
			this.world.pieces.filter((p) => p.id !== this.id),
			filters
		);
		pieces.sort((a, b) => this.distanceTo(a) - this.distanceTo(b));
		return pieces.slice(0, n);
	}

	isAdjacentTo(piece: Piece | Coord) {
		return this.distanceTo(piece) === 1;
	}

	getCoordsAfterMove(coords: Coord, move: { dx: number; dy: number }): Coord {
		let x = coords.x + move.dx;
		let y = coords.y + move.dy;
		if (x < 0) {
			x += this.world.size;
		} else if (x >= this.world.size) {
			x -= this.world.size;
		}
		if (y < 0) {
			y += this.world.size;
		} else if (y >= this.world.size) {
			y -= this.world.size;
		}
		return { x, y };
	}

	getEmptyAdjacentCoords(): (Coord & { dx: DistanceNumber; dy: DistanceNumber })[] {
		const coords = [];
		for (const dx of [0, 1, -1]) {
			for (const dy of [0, 1, -1]) {
				if (dx === 0 && dy === 0) {
					continue;
				}
				const { x, y } = this.getCoordsAfterMove(this, { dx, dy });
				const otherPieces = this.world.pieces.filter((p) => p.id !== this.id);
				if (otherPieces.some((p) => p.x === x && p.y === y)) {
					continue;
				}
				coords.push({ x, y, dx: dx as 0, dy: dy as 0 });
			}
		}
		return coords;
	}

	availableMoves() {
		const emptyAdjacentCoords = this.getEmptyAdjacentCoords();
		const moves: Move[] = [];
		for (const { dx, dy } of emptyAdjacentCoords) {
			moves.push({
				dx,
				dy,
				action: 'move'
			});
		}
		return moves;
	}

	moveTowards(piece: Piece | Coord, action: Action, secondaryDestination?: Piece | Coord): Move {
		if (this.isAdjacentTo(piece)) {
			let dx = 0 as DistanceNumber;
			let dy = 0 as DistanceNumber;
			if (piece.x - this.x === 1) dx = 1;
			else if (piece.x - this.x === -1) dx = -1;
			else if (piece.x - this.x > 1) dx = -1;
			else if (piece.x - this.x < -1) dx = 1;
			if (piece.y - this.y === 1) dy = 1;
			else if (piece.y - this.y === -1) dy = -1;
			else if (piece.y - this.y > 1) dy = -1;
			else if (piece.y - this.y < -1) dy = 1;
			return { dx, dy, action };
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
				const { x, y } = this.getCoordsAfterMove(this, move);
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

	moveAwayFrom(piece: Piece | Coord): Move {
		const moves = this.availableMoves()
			.map((move) => {
				const { x, y } = this.getCoordsAfterMove(this, move);
				const distance = Piece.distance({ x, y }, piece);
				return { move, distance };
			})
			.sort((a, b) => b.distance - a.distance);
		const bestMoves = moves.filter((m) => m.distance === moves[0].distance);
		console.log('bestMoves', bestMoves);
		debugger;
		return this.world.r.nextArrayElement(bestMoves).move;
	}
}

export type Action = 'move' | 'eat' | 'reproduce' | 'attack';

export type Move = {
	dx: DistanceNumber;
	dy: DistanceNumber;
	action: Action;
};

export type DistanceNumber = -1 | 0 | 1;
