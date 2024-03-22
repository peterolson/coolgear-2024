import type { RandomNumberGenerator } from './random';

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
			console.log('timeout!');
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
	const data = (await awaitResponse('evaluateFunction', { user, piece })) as { move: Move };
	return data.move;
}

export class World {
	size: number;
	pieces: Piece[];
	r: RandomNumberGenerator;
	code: Record<string, string>;

	constructor(obj: { size: number; pieces: Piece[]; r: RandomNumberGenerator }) {
		this.size = obj.size;
		this.pieces = obj.pieces;
		this.r = obj.r;
		this.code = {};
	}

	async setCode(user: string, code: string) {
		this.code[user] = code;
		await setFunction(user, code);
	}

	async step() {
		const moveablePieces = this.r.toShuffled(this.pieces.filter((p) => p.owner in this.code));
		for (const piece of moveablePieces) {
			const move = await evaluateFunction(piece.owner, piece);
			piece.x += move.dx;
			piece.y += move.dy;
			console.log('move', move);
		}
	}
}

export type Coord = {
	x: number;
	y: number;
};

export type WorldGenerator = (seed: string) => World;
