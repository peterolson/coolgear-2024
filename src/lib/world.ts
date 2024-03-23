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

	constructor(obj: { size: number; pieces: Piece[]; randomSeed: string }) {
		this.size = obj.size;
		this.pieces = obj.pieces;
		this.r = new RandomNumberGenerator(obj.randomSeed);
		this.code = {};
		this.initialState = JSON.stringify(obj);
	}

	reset() {
		const obj = JSON.parse(this.initialState);
		this.size = obj.size;
		this.pieces = obj.pieces;
		this.r = new RandomNumberGenerator(obj.randomSeed);
		this.code = {};
		return this;
	}

	async setCode(user: string, code: string) {
		this.code[user] = code;
		await setFunction(user, code);
	}

	async step() {
		const moveablePieces = this.r.toShuffled(this.pieces.filter((p) => p.owner in this.code));
		let hasMoved = false;
		for (const piece of moveablePieces) {
			try {
				const move = await evaluateFunction(piece.owner, piece);
				if ('error' in move) {
					console.error('error evaluating function:', move.error);
					continue;
				}
				if (!move) {
					console.error('move is undefined');
					continue;
				}
				if (move.dx !== 0 && move.dx !== 1 && move.dx !== -1) {
					console.error('dx must be 0, 1, or -1');
					continue;
				}
				if (move.dy !== 0 && move.dy !== 1 && move.dy !== -1) {
					console.error('dy must be 0, 1, or -1');
					continue;
				}
				const nextX = piece.x + move.dx;
				const nextY = piece.y + move.dy;
				if (nextX < 0 || nextX >= this.size || nextY < 0 || nextY >= this.size) {
					console.error('move out of bounds');
					continue;
				}
				if (move.action === 'move') {
					if (this.pieces.some((p) => p.x === nextX && p.y === nextY)) {
						console.error('cannot move into another piece');
						continue;
					}
					piece.x = nextX;
					piece.y = nextY;
					console.log('moved', piece);
					if (move.dx !== 0 || move.dy !== 0) hasMoved = true;
				} else if (move.action === 'eat') {
					const eaten = this.pieces.find((p) => p.x === nextX && p.y === nextY);
					if (!eaten) {
						console.error('nothing to eat there');
						continue;
					}
					this.pieces = this.pieces.filter((p) => p !== eaten);
					console.log('ate', eaten);
					hasMoved = true;
				}
			} catch (e) {
				console.error('error evaluating movie', e);
			}
		}
		return { hasMoved };
	}

	async run(notifyStepCompleted: () => Promise<void>) {
		const maxSteps = 1000;
		const maxConsecutiveNoMoves = 5;
		let consecutiveNoMoves = 0;
		for (let i = 0; i < maxSteps; i++) {
			const { hasMoved } = await this.step();
			await notifyStepCompleted();
			if (hasMoved) {
				consecutiveNoMoves = 0;
			} else {
				consecutiveNoMoves++;
			}
			if (consecutiveNoMoves >= maxConsecutiveNoMoves) {
				break;
			}
		}
	}
}

export type Coord = {
	x: number;
	y: number;
};

export type WorldGenerator = (seed: string) => World;
