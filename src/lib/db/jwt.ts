import type { User } from './db';
import { APP_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

export const createJWT = async (user: User) => {
	const payload = { data: { ...user } };
	return await jwt.sign(payload, APP_SECRET);
};

export const getUserFromToken = async (token: unknown) => {
	if (typeof token !== 'string') {
		return null;
	}
	const payload = await jwt.verify(token, APP_SECRET);
	if (typeof payload !== 'object' || !payload.data) {
		return null;
	}
	return payload.data as User;
};
