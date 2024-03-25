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
	memory: Record<string, any>;

	constructor(obj: {
		id: string;
		owner: string;
		type: PieceType;
		gender: Gender;
		x: number;
		y: number;
		memory: Record<string, any>;
	}) {
		this.id = obj.id;
		this.owner = obj.owner;
		this.type = obj.type;
		this.gender = obj.gender;
		this.x = obj.x;
		this.y = obj.y;
		this.memory = obj.memory;
	}

	toJSON() {
		return {
			id: this.id,
			owner: this.owner,
			type: this.type,
			gender: this.gender,
			x: this.x,
			y: this.y,
			memory: this.memory
		};
	}

	clone() {
		return new Piece(this.toJSON());
	}

	distanceTo(piece: Piece) {
		return Math.max(Math.abs(this.x - piece.x), Math.abs(this.y - piece.y));
	}

	findClosestPiece(world: World) {
		let minDistance = Infinity;
		let closestPiece: Piece | null = null;
		for (const piece of world.pieces) {
			if (piece.id === this.id) continue;
			const distance = this.distanceTo(piece);
			if (distance < minDistance) {
				minDistance = distance;
				closestPiece = piece;
			}
		}
		return closestPiece;
	}

	isAdjacentTo(piece: Piece) {
		return this.distanceTo(piece) === 1;
	}

	availableMoves(world: World) {
		const moves: Move[] = [];
		for (const dx of [-1, 0, 1]) {
			for (const dy of [-1, 0, 1]) {
				if (dx === 0 && dy === 0) {
					continue;
				}
				const x = this.x + dx;
				const y = this.y + dy;
				if (x < 0 || x >= world.size || y < 0 || y >= world.size) {
					continue;
				}
				const otherPieces = world.pieces.filter((p) => p.id !== this.id);
				if (otherPieces.some((p) => p.x === x && p.y === y)) {
					continue;
				}
				moves.push({ dx: dx as 0, dy: dy as 0, action: 'move' });
			}
		}
		return moves;
	}

	moveTowards(piece: Piece, action: Action, world?: World): Move {
		if (this.isAdjacentTo(piece)) {
			return { dx: (piece.x - this.x) as 0, dy: (piece.y - this.y) as 0, action };
		}
		if (world) {
			const moves = this.availableMoves(world);
			let minDistance = Infinity;
			let bestMove: Move = { dx: 0, dy: 0, action: 'move' };
			for (const move of moves) {
				const x = this.x + move.dx;
				const y = this.y + move.dy;
				const distance = Math.abs(piece.x - x) + Math.abs(piece.y - y);
				if (distance < minDistance) {
					minDistance = distance;
					bestMove = move;
				}
			}
			return bestMove;
		}
		const dx = piece.x > this.x ? 1 : piece.x < this.x ? -1 : 0;
		const dy = piece.y > this.y ? 1 : piece.y < this.y ? -1 : 0;
		return { dx, dy, action: 'move' };
	}
}

export type Action = 'move' | 'eat' | 'reproduce';

export type Move = {
	dx: -1 | 0 | 1;
	dy: -1 | 0 | 1;
	action: Action;
};
