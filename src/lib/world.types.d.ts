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

	/**
	 * Creates a new piece.
	 * @param {Object} obj - Object containing piece properties.
	 */
	constructor(obj: {
		id: string;
		owner: string;
		type: PieceType;
		gender: Gender;
		x: number;
		y: number;
		memory: Record<string, any>;
	}): Piece;

	/**
	 * Serializes the piece to a JSON object.
	 */
	toJSON(): {
		id: string;
		owner: string;
		type: PieceType;
		gender: Gender;
		x: number;
		y: number;
		memory: Record<string, any>;
	};

	/**
	 * Creates a copy of the piece.
	 * @returns {Piece} The copied piece.
	 */
	clone(): Piece;

	/**
	 * Calculates the distance to another piece.
	 * @param {Piece} piece - The other piece to calculate the distance to.
	 * @returns {number} The distance to the other piece.
	 */
	distanceTo(piece: Piece): number;

	/**
	 * Finds the closest piece in the world.
	 * @param {World} world - The world to search for the closest piece in.
	 * @returns {Piece | null} The closest piece, or null if no other pieces are in the world.
	 */
	findClosest(world: World): Piece | null;

	/**
	 * Checks if a piece is adjacent to another piece.
	 * @param {Piece} piece - The other piece to check adjacency to.
	 * @returns {boolean} True if the pieces are adjacent, false otherwise.
	 */
	isAdjacentTo(piece: Piece): boolean;

	/**
	 * Gets the moves available to the piece.
	 * @param {World} world - The world the piece is in.
	 * @returns {Move[]} Array of moves available to the piece.
	 */
	availableMoves(world: World): Move[];

	/**
	 * Finds the shortest move towards another piece.
	 * @param {Piece} piece - The other piece to move towards.
	 * @param {Action} action - Action to take once this piece is adjacent to the other piece.
	 * @param {World} [world] - The world the piece is in.
	 * @returns {Move} The move to take.
	 */
	moveTowards(piece: Piece, action: Action, world?: World): Move;
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
	action: Action;
};

/**
 * Action to take during a turn.
 */
declare type Action = 'move' | 'eat' | 'reproduce';

declare function log(...args: any[]): void;

/**
 * Object representing a world with pieces.
 * @class
 * @property {number} size - The width and height of the world. (Worlds are always square)
 * @property {Piece[]} pieces - Array of pieces in the world.
 * @property {number} moveCount - Number of moves made so far.
 */
declare class World {
	/**
	 * The width and height of the world. (Worlds are always square)
	 */
	size: number;
	/**
	 * Array of pieces in the world.
	 */
	pieces: Piece[];

	/**
	 * Number of moves made so far.
	 */
	moveCount: number;
}
