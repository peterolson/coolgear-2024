// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function cyrb128(str: string): [number, number, number, number] {
	let h1 = 1779033703,
		h2 = 3144134277,
		h3 = 1013904242,
		h4 = 2773480762;
	for (let i = 0, k; i < str.length; i++) {
		k = str.charCodeAt(i);
		h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
		h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
		h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
		h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
	}
	h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
	h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
	h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
	h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
	(h1 ^= h2 ^ h3 ^ h4), (h2 ^= h1), (h3 ^= h1), (h4 ^= h1);
	return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

function xoshiro128ss(a: number, b: number, c: number, d: number) {
	return function (): number {
		let t = b << 9,
			r = b * 5;
		r = ((r << 7) | (r >>> 25)) * 9;
		c ^= a;
		d ^= b;
		b ^= c;
		a ^= d;
		c ^= t;
		d = (d << 11) | (d >>> 21);
		return (r >>> 0) / 4294967296;
	};
}

export class RandomNumberGenerator {
	public nextRand: () => number;
	constructor(seed: string) {
		this.nextRand = xoshiro128ss(...cyrb128(seed));
	}
	public nextRandBetween(inclusiveMin: number, exclusiveMax: number): number {
		return this.nextRand() * (exclusiveMax - inclusiveMin) + inclusiveMin;
	}
	public nextRandBetweenInclusive(min: number, max: number): number {
		return Math.floor(this.nextRand() * (max - min + 1)) + min;
	}
	public nextRandBool(): boolean {
		return this.nextRand() < 0.5;
	}
	public nextInt(exclusiveMax: number): number {
		return Math.floor(this.nextRand() * exclusiveMax);
	}
	public nextIntBetween(inclusiveMin: number, exclusiveMax: number): number {
		return Math.floor(this.nextRand() * (exclusiveMax - inclusiveMin)) + inclusiveMin;
	}
	public nextIntBetweenInclusive(min: number, max: number): number {
		return Math.floor(this.nextRand() * (max - min + 1)) + min;
	}
	public nextArrayElement<T>(arr: T[]): T {
		return arr[this.nextInt(arr.length)];
	}
	public nextCoordinate(size: number) {
		return {
			x: this.nextInt(size),
			y: this.nextInt(size)
		};
	}
	public nextUUID() {
		const a = this.nextInt(4294967296);
		const b = this.nextInt(4294967296);
		const c = this.nextInt(4294967296);
		const d = this.nextInt(4294967296);
		return `${a.toString(16)}-${b.toString(16)}-${c.toString(16)}-${d.toString(16)}`;
	}
}
