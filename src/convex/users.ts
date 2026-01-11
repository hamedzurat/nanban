import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		return await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', email))
			.first();
	}
});

export const create = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		password: v.string(),
		avatarURL: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.first();
		if (existing) throw new Error('Email already in use');

		return await ctx.db.insert('users', args);
	}
});
