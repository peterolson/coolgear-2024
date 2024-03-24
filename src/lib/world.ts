import { RandomNumberGenerator } from './random';

let worker = new Worker(new URL('$lib/codeWorker', import.meta.url));

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
			worker = new Worker(new URL('$lib/codeWorker', import.meta.url));
			resolve(null);
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

export async function evaluateFunction(user: string, piece: Piece) {
	const data = (await awaitResponse('evaluateFunction', { user, piece })) as {
		move: Move | { error: string };
	};
	return data.move;
}

export class World {
	size: number;
	pieces: Piece[];
	r: RandomNumberGenerator;
	code: Record<string, string>;
	initialState: string;
	logs: { message: string; level: string; piece?: Piece; move?: Move; recipient?: Piece }[];
	moveCount: number;

	constructor(obj: { size: number; pieces: Piece[]; randomSeed: string }) {
		this.size = obj.size;
		this.pieces = obj.pieces;
		this.r = new RandomNumberGenerator(obj.randomSeed);
		this.code = {};
		this.initialState = JSON.stringify(obj);
		this.logs = [];
		this.moveCount = 0;
	}

	reset() {
		const obj = JSON.parse(this.initialState);
		this.size = obj.size;
		this.pieces = obj.pieces;
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
			piece: piece ? { ...piece } : undefined,
			move: move ? { ...move } : undefined,
			recipient: recipient ? { ...recipient } : undefined
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
		const moveablePieces = this.r.toShuffled(this.pieces.filter((p) => p.owner in this.code));
		let hasMoved = false;
		this.moveCount++;
		this.log(`step ${this.moveCount}`);
		for (const piece of moveablePieces) {
			const logPiece = { ...piece };
			try {
				const move = await evaluateFunction(piece.owner, piece);
				if ('error' in move) {
					this.error(`error evaluating function: ${move.error}`, logPiece);
					continue;
				}
				if (!move) {
					this.error('move is undefined', logPiece);
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
					this.pieces = this.pieces.filter((p) => p !== eaten);
					this.log('ate', piece, move, eaten);
					hasMoved = true;
				}
			} catch (e) {
				this.error('error evaluating function', logPiece);
			}
		}
		return { hasMoved };
	}

	async run(notifyStepCompleted: () => Promise<void>) {
		const maxSteps = 1000;
		const maxConsecutiveNoMoves = 5;
		let consecutiveNoMoves = 0;
		let i = 0;
		for (; i < maxSteps; i++) {
			const { hasMoved } = await this.step();
			await notifyStepCompleted();
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
}

export type Coord = {
	x: number;
	y: number;
};

export type WorldGenerator = (seed: string) => World;
