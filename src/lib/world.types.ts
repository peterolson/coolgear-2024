export type PieceType = 'Man' | 'Woman' | 'Food';

export class Piece {
	id: string;
	owner: string;
	type: 'Man' | 'Woman' | 'Food';
	x: number;
	y: number;
	memory: Record<string, any>;

	constructor(obj: {
		id: string;
		owner: string;
		type: PieceType;
		x: number;
		y: number;
		memory: Record<string, any>;
	}) {
		this.id = obj.id;
		this.owner = obj.owner;
		this.type = obj.type;
		this.x = obj.x;
		this.y = obj.y;
		this.memory = obj.memory;
	}
}

export type Move = {
	dx: -1 | 0 | 1;
	dy: -1 | 0 | 1;
	action: 'move' | 'eat' | 'reproduce';
};

export type World = {
	size: number;
	pieces: Piece[];
};

export type Coord = {
	x: number;
	y: number;
};

export type WorldGenerator = (seed: string) => World;
