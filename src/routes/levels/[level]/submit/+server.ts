import { DB } from '$lib/db/db';
import { getUserFromToken } from '$lib/db/jwt';
import { levels } from '$lib/levels/levels';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, params, request }) => {
	const user = await getUserFromToken(cookies.get('user'));
	if (!user) {
		return new Response('unauthorized', { status: 401 });
	}
	const level = params.level;
	if (!level) {
		return new Response('level is required', { status: 400 });
	}
	const levelIndex = +level - 1;
	const levelData = levels[levelIndex];
	if (!levelData) {
		return new Response('level not found', { status: 404 });
	}
	const levelId = levelData.id;
	const { code, scores } = await request.json();
	const db = await DB.getInstance();
	await db.submitCode(levelId, code, user._id, scores);
	return new Response(null, { status: 200 });
};
