import { DB } from '$lib/db/db';
import { createJWT } from '$lib/db/jwt';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString();
		const password = formData.get('password')?.toString();
		if (!username) {
			return fail(400, { username, error: 'username is required' });
		}
		if (!password) {
			return fail(400, { username, error: 'password is required' });
		}
		try {
			const db = await DB.getInstance();
			const user = await db.logIn(username, password);
			const jwt = await createJWT(user);
			cookies.set('user', jwt, { path: '/' });
		} catch (e) {
			console.error(e);
			return fail(400, { username, error: String(e) });
		}
		return redirect(303, '/levels');
	}
};
