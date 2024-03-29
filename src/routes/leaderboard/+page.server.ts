import { DB, type CodeVersion } from '$lib/db/db';

import { levels } from '$lib/levels/levels';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const db = await DB.getInstance();
	const userNames = await db.getUserNames();
	const leaderboardPromises = levels.map((level) => {
		return db.getLeaderBoard(level.id, level.scoring.highestBest ? -1 : 1);
	});
	const leaderboards = await Promise.all(leaderboardPromises);
	return {
		leaderboards,
		userNames
	};
};
