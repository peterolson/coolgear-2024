export type Piece = {
	id: string;
	owner: string;
	type: 'Man' | 'Woman' | 'Food';
	x: number;
	y: number;
	memory: Record<string, any>;
};

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
