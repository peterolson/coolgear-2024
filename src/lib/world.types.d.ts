/**
 * Object representing a piece in the world, such as a character or food.
 * @class
 * @property {string} id - Unique identifier for the piece.
 * @property {'human' | 'food'} type - Type of the piece.
 * @property {'male' | 'female' | undefined} gender - Gender of the piece, if the piece is capable of reproduction.
 * @property {string} owner - Who controls the piece. Uses a user's name or 'map'.
 * @property {number} x - x-coordinate of the piece.
 * @property {number} y - y-coordinate of the piece.
 * @property {Record<string, any>} memory - Memory of the piece. Can be used to store any data.
 */
declare class Piece {
	/**
	 * Unique identifier for the piece.
	 */
	id: string;
	/**
	 * Type of the piece.
	 */
	type: 'human' | 'food';
	/**
	 * Gender of the piece, if the piece is capable of reproduction.
	 */
	gender: 'male' | 'female' | undefined;
	/**
	 * Who controls the piece. Uses a user's name or 'map'.
	 */
	owner: string;
	/**
	 * x-coordinate of the piece.
	 */
	x: number;
	/**
	 * y-coordinate of the piece.
	 */
	y: number;
	/**
	 * Memory of the piece. Can be used to store any data.
	 */
	memory: Record<string, any>;
}

/**
 * Object representing a move and action to take during a turn.
 */
declare type Move = {
	/**
	 * Change in x-coordinate.
	 * -1 for left, 0 for no change, 1 for right.
	 */
	dx: -1 | 0 | 1;
	/**
	 * Change in y-coordinate.
	 * -1 for up, 0 for no change, 1 for down.
	 */
	dy: -1 | 0 | 1;
	/**
	 * Action to take.
	 */
	action: 'move' | 'eat' | 'reproduce';
};

declare function log(...args: any[]): void;
