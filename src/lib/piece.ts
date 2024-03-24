export type PieceType = 'human' | 'food';
export type Gender = 'male' | 'female' | undefined;

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
}

export type Move = {
	dx: -1 | 0 | 1;
	dy: -1 | 0 | 1;
	action: 'move' | 'eat' | 'reproduce';
};
