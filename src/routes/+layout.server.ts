import type { LayoutServerLoad } from './$types';
import { readFile } from 'fs/promises';

export const load: LayoutServerLoad = async () => {
	const worldTypes = await readFile('src/lib/world.types.d.ts', 'utf-8');
	return {
		lib: {
			worldTypes
		}
	};
};
