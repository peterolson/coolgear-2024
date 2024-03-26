import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';

export const load: PageServerLoad = async () => {
	const worldTypes = await readFile('src/lib/world.types.d.ts', 'utf-8');
	return {
		lib: {
			worldTypes
		}
	};
};
