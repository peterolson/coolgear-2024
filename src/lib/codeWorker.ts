import { Piece, type World } from './piece';
import { RandomNumberGenerator } from './random';

function jsonifyArgs(args: any[]): any {
	function jsonify(arg: any) {
		if (!(arg instanceof Object)) {
			return arg;
		}
		if (arg === null) {
			return null;
		}
		if (arg instanceof Piece) {
			return arg.toJSON();
		}
		if ('size' in arg && 'pieces' in arg && 'moveCount' in arg) {
			return {
				size: arg.size,
				pieces: jsonifyArgs(arg.pieces),
				moveCount: arg.moveCount
			};
		}
		return JSON.parse(JSON.stringify(arg));
	}
	return args.map(jsonify);
}

function createFunction(code: string) {
	const console = {
		log: (...args: any[]) => {
			self.postMessage({ id: 'log', type: 'info', args: jsonifyArgs(args) });
		},
		error: (...args: any[]) => {
			self.postMessage({ id: 'log', type: 'error', args: jsonifyArgs(args) });
		}
	};
	const log = console.log;
	try {
		return eval(`(() => {${code}; return nextMove;})()`);
	} catch (e) {
		console.error(e);
		let stack = '';
		if (e instanceof Error) {
			stack = `\n${e.stack || ''}`;
		}
		return () => ({ error: String(e) + stack });
	}
}

const functionMap = new Map<
	string,
	(self: Piece, world: World, r: RandomNumberGenerator) => Move
>();
const randomMap = new Map<string, RandomNumberGenerator>();

function setFunction(user: string, code: string) {
	functionMap.set(user, createFunction(code));
	randomMap.set(user, new RandomNumberGenerator(user + code));
}

function evaluateFunction(user: string, piece: Piece, world: World) {
	const func = functionMap.get(user);
	if (!func) {
		return null;
	}
	const rand = randomMap.get(user);
	if (!rand) {
		return null;
	}
	try {
		piece = new Piece({ ...piece, world });
		world.pieces = world.pieces.map((p) => new Piece({ ...p, world }));
		world.r = rand;
		return func(piece, world, rand);
	} catch (e) {
		console.error(e);
		let stack = '';
		if (e instanceof Error) {
			stack = `\n${e.stack || ''}`;
		}
		return { error: String(e) + stack };
	}
}

self.onmessage = (e) => {
	const id = e.data.id;
	if (e.data.type === 'setFunction') {
		setFunction(e.data.user, e.data.code);
		self.postMessage({ id, type: 'setFunction', user: e.data.user });
	} else if (e.data.type === 'evaluateFunction') {
		const move = evaluateFunction(e.data.user, e.data.piece, e.data.world);
		self.postMessage({ id, type: 'evaluateFunction', move });
	}
};
