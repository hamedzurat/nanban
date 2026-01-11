import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		return await ctx.db
			.query('orgs')
			.withIndex('by_slug', (q) => q.eq('slug', slug))
			.first();
	}
});

export const create = mutation({
	args: { name: v.string(), slug: v.string() },
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('orgs')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();
		if (existing) throw new Error('Org slug already exists');

		return await ctx.db.insert('orgs', args);
	}
});
