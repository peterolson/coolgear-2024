import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('user', { path: '/' });
	return new Response(null, { status: 303, headers: { location: '/' } });
};
