import { getUserFromToken } from '$lib/db/jwt';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = await getUserFromToken(cookies.get('user'));
	return {
		user: user
	};
};
