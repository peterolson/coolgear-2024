import { Collection, Db, MongoClient } from 'mongodb';
import { MONGO_URL } from '$env/static/private';
import { compare, hash } from 'bcrypt';

export type User = {
	_id: string;
	username: string;
	displayName: string;
	passwordHash: string;
};

export type CodeVersion = {
	_id: string;
	levelId: string;
	code: string;
	userId: string;
	createdAt: Date;
};

export class DB {
	private static instance: DB;
	private client: MongoClient;
	private db: Db;
	private userCollection: Collection<User>;
	private codeVersionCollection: Collection<CodeVersion>;

	private constructor() {
		this.client = new MongoClient(MONGO_URL);
		this.db = this.client.db('coolgear');
		this.userCollection = this.db.collection('users');
		this.codeVersionCollection = this.db.collection('codeVersions');
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new DB();
		}
		return this.instance;
	}

	async createUser(displayName: string, password: string) {
		const passwordHash = await hash(password, 10);
		const _id = crypto.randomUUID();
		const username = displayName.toLowerCase().trim();
		const existingUser = await this.userCollection.findOne({ username });
		if (existingUser) {
			throw new Error('User already exists');
		}
		await this.userCollection.insertOne({
			_id,
			username,
			displayName: displayName.trim(),
			passwordHash
		});
	}

	async logIn(displayName: string, password: string) {
		const username = displayName.toLowerCase().trim();
		const user = await this.userCollection.findOne({ username });
		if (!user) {
			throw new Error('User not found');
		}
		const match = await compare(password, user.passwordHash);
		if (!match) {
			throw new Error('Incorrect password');
		}
		return user;
	}

	async saveCodeVersion(levelId: string, userId: string, code: string) {
		const createdAt = new Date();
		await this.codeVersionCollection.insertOne({
			_id: crypto.randomUUID(),
			levelId,
			userId,
			code,
			createdAt
		});
	}

	async getCodeVersions(levelId: string, userId: string) {
		return await this.codeVersionCollection
			.find(
				{ levelId, userId },
				{
					sort: { createdAt: -1 }
				}
			)
			.toArray();
	}
}
