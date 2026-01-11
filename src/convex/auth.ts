import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const login = mutation({
	args: { email: v.string(), password: v.string() },
	handler: async (ctx, { email, password }) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', email))
			.first();

		if (!user) return null;
		if (user.password !== password) return null;

		return {
			userId: user._id,
			name: user.name,
			email: user.email,
			avatarURL: user.avatarURL ?? null
		};
	}
});
