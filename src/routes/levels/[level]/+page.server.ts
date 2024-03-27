import { getUserFromToken } from '$lib/db/jwt';
import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { level } = params;
	const worldTypes = await readFile('src/lib/world.types.d.ts', 'utf-8');
	const user = await getUserFromToken(cookies.get('user'));
	return {
		level: +level,
		user,
		lib: {
			worldTypes
		}
	};
};
