import { RandomNumberGenerator } from './random';
import { Piece } from './piece';

let worker =
	typeof Worker !== 'undefined'
		? new Worker(new URL('$lib/codeWorker', import.meta.url), { type: 'module' })
		: ({} as Worker);

const listeners = new Map<string, (e: any) => void>();

worker.onmessage = (e) => {
	const id = e.data.id;
	const listener = listeners.get(id);
	if (listener) {
		listener(e.data);
	}
};

async function awaitResponse(type: string, args: Record<string, any>) {
	const id = crypto.randomUUID();
	worker.postMessage({ type: type, id, ...args });
	return new Promise((resolve) => {
		const timeout = setTimeout(() => {
			listeners.delete(id);
			console.error('timeout! took longer than 1s to respond');
			worker.terminate();
			const messageListener = worker.onmessage;
			worker = new Worker(new URL('$lib/codeWorker', import.meta.url), { type: 'module' });
			worker.onmessage = messageListener;
			resolve({
				move: {
					error: 'timeout! took longer than 1s to respond'
				}
			});
		}, 1000);
		listeners.set(id, (e) => {
			resolve(e);
			listeners.delete(id);
			clearTimeout(timeout);
		});
	});
}

export function setFunction(user: string, code: string) {
	return awaitResponse('setFunction', { user, code });
}

export async function evaluateFunction(
	user: string,
	piece: Piece,
	world: {
		pieces: Piece[];
		size: number;
		moveCount: number;
	}
) {
	const data = (await awaitResponse('evaluateFunction', {
		user,
		piece: { ...piece, world: null },
		world: { ...world, pieces: world.pieces.map((p) => ({ ...p, world: null })) }
	})) as {
		move: Move | { error: string };
	};
	return data.move;
}

const getCircularReplacer = () => {
	const seen = new WeakSet();
	return (key: string, value: unknown) => {
		if (typeof value === 'object' && value !== null) {
			if ('world' in value)
				return {
					...value,
					world: undefined
				};
			if (seen.has(value)) {
				return;
			}
			seen.add(value);
		}
		return value;
	};
};

export class World {
	size: number;
	pieces: Piece[];
	r: RandomNumberGenerator;
	code: Record<string, string>;
	initialState: string;
	logs: {
		message: string;
		level: string;
		piece?: Record<string, any>;
		move?: Move;
		recipient?: Record<string, any>;
	}[];
	moveCount: number;
	victoryCondition: (w: World) => boolean;
	lossCondition?: (w: World) => boolean;
	betweenSteps?: (w: World) => void;

	constructor(obj: {
		size: number;
		pieces: Piece[];
		randomSeed: string;
		victoryCondition: (w: World) => boolean;
		lossCondition?: (w: World) => boolean;
		betweenSteps?: (w: World) => void;
	}) {
		this.size = obj.size;
		this.pieces = obj.pieces;
		this.r = new RandomNumberGenerator(obj.randomSeed);
		this.code = {};
		this.initialState = JSON.stringify(obj, getCircularReplacer());
		this.logs = [];
		this.moveCount = 0;
		listeners.set('log', (e) => {
			const { type, args } = e;
			const message = args.map((a: any) => JSON.stringify(a, getCircularReplacer(), 2)).join(' ');
			if (type === 'info') {
				this.log(message);
			} else if (type === 'error') {
				console.error(message);
				this.error(message);
			}
		});
		this.victoryCondition = obj.victoryCondition;
		this.lossCondition = obj.lossCondition;
		this.betweenSteps = obj.betweenSteps;
	}

	reset() {
		const obj = JSON.parse(this.initialState);
		this.size = obj.size;
		this.pieces = obj.pieces.map((p: Piece) => new Piece(p));
		this.r = new RandomNumberGenerator(obj.randomSeed);
		this.code = {};
		this.logs = [];
		this.moveCount = 0;
		return this;
	}

	private addToLog(message: string, level: string, piece?: Piece, move?: Move, recipient?: Piece) {
		this.logs.push({
			message: message,
			level,
			piece: piece ? piece.toJSON() : undefined,
			move: move ? { ...move } : undefined,
			recipient: recipient ? recipient.toJSON() : undefined
		});
	}

	private log(message: string, piece?: Piece, move?: Move, recipient?: Piece) {
		this.addToLog(message, 'info', piece, move, recipient);
	}
	private error(message: string, piece?: Piece, move?: Move, recipient?: Piece) {
		this.addToLog(message, 'error', piece, move, recipient);
	}

	async setCode(user: string, code: string) {
		this.code[user] = code;
		await setFunction(user, code);
	}

	async step() {
		const moveablePieces = this.pieces.filter((p) => p.owner in this.code);
		let hasMoved = false;
		this.moveCount++;
		this.log(`step ${this.moveCount}`);
		for (const piece of moveablePieces) {
			// skip if piece is dead
			if (piece.hitpoints <= 0) continue;
			const logPiece = piece.clone();
			try {
				const world = {
					pieces: this.pieces,
					size: this.size,
					moveCount: this.moveCount
				};
				const move = await evaluateFunction(piece.owner, piece, world);
				if (!move) {
					this.error('move is undefined', logPiece);
					continue;
				}
				if ('error' in move) {
					this.error(`error evaluating function: ${move.error}`, logPiece);
					continue;
				}
				if (move.dx !== 0 && move.dx !== 1 && move.dx !== -1) {
					this.error('dx must be 0, 1, or -1', logPiece, move);
					continue;
				}
				if (move.dy !== 0 && move.dy !== 1 && move.dy !== -1) {
					this.error('dy must be 0, 1, or -1', logPiece, move);
					continue;
				}
				if (move.dx === 0 && move.dy === 0 && move.action === 'move') {
					this.log('sat still', logPiece, move);
					continue;
				}
				const nextX = piece.x + move.dx;
				const nextY = piece.y + move.dy;
				if (nextX < 0 || nextX >= this.size || nextY < 0 || nextY >= this.size) {
					this.error('cannot move out of bounds!', logPiece, move);
					continue;
				}
				if (move.action === 'move') {
					if (this.pieces.some((p) => p.x === nextX && p.y === nextY)) {
						this.error('cannot move there, already occupied!', logPiece, move);
						continue;
					}
					piece.x = nextX;
					piece.y = nextY;
					this.log(`moved to (${nextX},${nextY})`, logPiece, move);
					if (move.dx !== 0 || move.dy !== 0) hasMoved = true;
				} else if (move.action === 'eat') {
					const eaten = this.pieces.find((p) => p.x === nextX && p.y === nextY);
					if (!eaten) {
						this.error('nothing to eat there!', logPiece, move);
						continue;
					}

					if (move.dx === 0 && move.dy === 0) {
						this.pieces = this.pieces.filter((p) => p !== eaten);
						this.log('committed suicide via autocannibalism', piece, move);
						hasMoved = true;
						continue;
					}
					if (eaten.type !== 'food') {
						this.error("can't eat that, it's not edible!");
						continue;
					}
					if (piece.hitpoints < piece.maxHitpoints) {
						piece.hitpoints = Math.min(piece.hitpoints + 1, piece.maxHitpoints);
					} else {
						piece.maxHitpoints += 1 / piece.maxHitpoints;
						piece.hitpoints = piece.maxHitpoints;
					}
					this.pieces = this.pieces.filter((p) => p !== eaten);
					this.log('ate', piece, move, eaten);
					hasMoved = true;
				} else if (move.action === 'attack') {
					const attacked = this.pieces.find((p) => p.x === nextX && p.y === nextY);
					if (!attacked) {
						this.error('nothing to attack there!', logPiece, move);
						continue;
					}
					const attack = piece.attack;
					attacked.hitpoints -= attack;
					if (attacked.hitpoints <= 0) {
						this.pieces = this.pieces.filter((p) => p.id !== attacked.id);
						const hitsToKill = attacked.maxHitpoints / piece.attack;
						const hitsToBeKilled = piece.maxHitpoints / attacked.attack;
						const attackImprovement = Math.min(5, hitsToKill / hitsToBeKilled);
						piece.attack += attackImprovement;
						this.log('killed', logPiece, move, attacked);
					} else {
						this.log('attacked', logPiece, move, attacked);
					}
				}
			} catch (e) {
				console.error(e);
				this.error(`error evaluating function: ${String(e)}`, logPiece);
			}
		}
		this.betweenSteps?.(this);
		return { hasMoved };
	}

	async run(notifyStepCompleted: () => Promise<boolean>) {
		if (this.victoryCondition(this)) {
			this.log('Already solved this map');
			return;
		}
		if (this.lossCondition?.(this)) {
			this.log('You have been defeated. :(');
			return;
		}
		const maxSteps = 1000;
		const maxConsecutiveNoMoves = 5;
		let consecutiveNoMoves = 0;
		let i = 0;
		for (; i < maxSteps; i++) {
			const { hasMoved } = await this.step();
			const isStopped = await notifyStepCompleted();
			if (isStopped) {
				this.log('Stopped manually by user.');
				return;
			}
			if (this.lossCondition?.(this)) {
				this.log('You have been defeated. :(');
				return;
			}
			if (this.victoryCondition(this)) {
				this.log(`Victory! You solved this map in ${this.moveCount} steps!`);
				return;
			}
			if (hasMoved) {
				consecutiveNoMoves = 0;
			} else {
				consecutiveNoMoves++;
			}
			if (consecutiveNoMoves >= maxConsecutiveNoMoves) {
				this.log(`no moves for ${maxConsecutiveNoMoves} consecutive steps, stopping...`);
				break;
			}
		}
		this.log(`stopped after ${this.moveCount} steps`);
	}

	isSolved() {
		return this.victoryCondition(this);
	}
}

export type Coord = {
	x: number;
	y: number;
};

export type WorldGenerator = (seed: string, user: string) => World;

export type WorldScoring = {
	title: string;
	evaluator: (w: World) => number;
	highestBest: boolean;
};
