function createFunction(code: string) {
	try {
		return eval(`(() => {${code}; return nextMove;})()`);
	} catch (e) {
		return () => ({ error: String(e) });
	}
}

const functionMap = new Map<string, (self: Piece) => Move>();

function setFunction(user: string, code: string) {
	functionMap.set(user, createFunction(code));
}

function evaluateFunction(user: string, piece: Piece) {
	const func = functionMap.get(user);
	if (!func) {
		return null;
	}
	try {
		return func(piece);
	} catch (e) {
		return { error: String(e) };
	}
}

self.onmessage = (e) => {
	const id = e.data.id;
	if (e.data.type === 'setFunction') {
		setFunction(e.data.user, e.data.code);
		self.postMessage({ id, type: 'setFunction', user: e.data.user });
	} else if (e.data.type === 'evaluateFunction') {
		const move = evaluateFunction(e.data.user, e.data.piece);
		self.postMessage({ id, type: 'evaluateFunction', move });
	}
};
