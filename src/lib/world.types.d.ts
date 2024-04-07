/**
 * Object representing a piece in the world, such as a character or food.
 * @class
 * @property {string} id - Unique identifier for the piece.
 * @property {'human' | 'food'} type - Type of the piece.
 * @property {'male' | 'female' | undefined} gender - Gender of the piece, if the piece is capable of reproduction.
 * @property {string} owner - Who controls the piece. Uses a user's name or 'map'.
 * @property {number} x - x-coordinate of the piece.
 * @property {number} y - y-coordinate of the piece.
 * @property {World} world - The world the piece is in.
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
	 * The world the piece is in.
	 */
	world: World;
	/**
	 * Hitpoints of the piece.
	 */
	hitpoints: number;
	/**
	 * Maximum hitpoints of the piece.
	 */
	maxHitpoints: number;
	/**
	 * Attack power of the piece.
	 */
	attack: number;

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
		world: World;
		hitpoints?: number;
		maxHitpoints?: number;
		attack?: number;
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
		hitpoints: number;
		maxHitpoints: number;
		attack: number;
	};

	/**
	 * Creates a copy of the piece.
	 * @returns {Piece} The copied piece.
	 */
	clone(): Piece;

	/**
	 * Calculates the distance between two pieces.
	 * @param {Piece | Coord} a - The first piece.
	 * @param {Piece | Coord} b - The second piece.
	 * @returns {number} The distance between the two pieces.
	 */
	static distance(a: Piece | Coord, b: Piece | Coord): number;

	/**
	 * Calculates the distance to another piece.
	 * @param {Piece} piece - The other piece to calculate the distance to.
	 * @returns {number} The distance to the other piece.
	 */
	distanceTo(piece: Piece | Coord): number;

	/**
	 * Finds the closest piece in the world.
	 * @returns {Piece | null} The closest piece, or null if no other pieces are in the world.
	 */
	findClosestPiece(): Piece | null;

	/**
	 * Finds the *n* closest pieces in the world, sorted by distance.
	 * @param {number} n - The number of closest pieces to find.
	 * @returns {Piece[]} Array of the closest pieces.
	 */
	findClosestPieces(n: number): Piece[];

	/**
	 * Checks if a piece is adjacent to another piece.
	 * @param {Piece | Coord} piece - The other piece to check adjacency to.
	 * @returns {boolean} True if the pieces are adjacent, false otherwise.
	 */
	isAdjacentTo(piece: Piece | Coord): boolean;

	/**
	 * Gets the empty spaces adjacent to the piece.
	 * @returns {Coord[]} Array of coordinates of adjacent spaces.
	 */
	getEmptyAdjacentCoords(): Coord[];

	/**
	 * Gets the moves available to the piece.
	 * @returns {Move[]} Array of moves available to the piece.
	 */
	availableMoves(): Move[];

	/**
	 * Finds the shortest move towards another piece.
	 * @param {Piece | Coord} piece - The other piece to move towards.
	 * @param {Action} action - Action to take once this piece is adjacent to the other piece.
	 * @param  {Piece | Coord} [secondaryDestination] - (optional) The piece to move towards after reaching the first piece.
	 * @returns {Move} The move to take.
	 */
	moveTowards(piece: Piece | Coord, action: Action, secondaryDestination?: Piece | Coord): Move;
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

/**
 * x, y coordinates of a place in the world.
 */
declare type Coord = { x: number; y: number };

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

declare class RandomNumberGenerator {
	/**
	 * Creates a new random number generator.
	 * @param {string} seed - Seed for the random number generator.
	 */
	constructor(seed: string);

	/**
	 * Generates a random number between 0 and 1.
	 * @returns {number} Random number between 0 and 1.
	 */
	nextRand(): number;

	/**
	 * Generates a random number between two values.
	 * @param {number} inclusiveMin - Minimum value, inclusive.
	 * @param {number} exclusiveMax - Maximum value, exclusive.
	 * @returns {number} Random number between the two values.
	 */
	nextRandBetween(inclusiveMin: number, exclusiveMax: number): number;

	/**
	 * Generates a random number between two values, inclusive.
	 * @param {number} min - Minimum value, inclusive.
	 * @param {number} max - Maximum value, inclusive.
	 * @returns {number} Random number between the two values.
	 */
	nextRandBetweenInclusive(min: number, max: number): number;

	/**
	 * Generates a random boolean value.
	 * @returns {boolean} Random boolean value.
	 */
	nextRandBool(): boolean;

	/**
	 * Generates a random integer.
	 * @param {number} exclusiveMax - Maximum value, exclusive.
	 * @returns {number} Random integer.
	 */
	nextInt(exclusiveMax: number): number;

	/**
	 * Generates a random integer between two values.
	 * @param {number} inclusiveMin - Minimum value, inclusive.
	 * @param {number} exclusiveMax - Maximum value, exclusive.
	 * @returns {number} Random integer between the two values.
	 */
	nextIntBetween(inclusiveMin: number, exclusiveMax: number): number;

	/**
	 * Generates a random integer between two values, inclusive.
	 * @param {number} min - Minimum value, inclusive.
	 * @param {number} max - Maximum value, inclusive.
	 * @returns {number} Random integer between the two values.
	 */
	nextIntBetweenInclusive(min: number, max: number): number;

	/**
	 * Gets a random element from an array.
	 * @param {T[]} arr - Array to get a random element from.
	 * @returns {T} Random element from the array.
	 */
	nextArrayElement<T>(arr: T[]): T;

	/**
	 * Generates a random coordinate.
	 * @param {number} size - Size of the coordinate.
	 * @returns {{x: number, y: number}} Random coordinate.
	 */
	nextCoordinate(size: number): Coord;

	/**
	 * Generates a random UUID.
	 * @returns {string} Random UUID.
	 */
	nextUUID(): string;

	/**
	 * Shuffles an array.
	 * @param {T[]} arr - Array to shuffle.
	 * @returns {T[]} Shuffled array.
	 */
	toShuffled<T>(arr: T[]): T[];

	/**
	 * Gets a random element from an array, weighted by a set of weights.
	 * @param {T[]} arr - Array to get a random element from.
	 * @param {number[] | ((item: T) => number)} weights - Array of weights or function to get weights from elements.
	 * @returns {T} Random element from the array.
	 */
	nextWeightedElement<T>(arr: T[], weights: number[] | ((item: T) => number)): T;
}
