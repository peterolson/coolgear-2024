import { DB, type CodeVersion } from '$lib/db/db';
import { getUserFromToken } from '$lib/db/jwt';
import { levels } from '$lib/levels/levels';
import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { level } = params;
	const worldTypes = await readFile('src/lib/world.types.d.ts', 'utf-8');
	const user = await getUserFromToken(cookies.get('user'));
	const levelData = levels[+level - 1];
	let codeVersions: CodeVersion[] = [];
	if (user) {
		const db = await DB.getInstance();
		codeVersions = await db.getCodeVersions(levelData.id, user?._id);
	}
	return {
		level: +level,
		user,
		lib: {
			worldTypes
		},
		codeVersions
	};
};
