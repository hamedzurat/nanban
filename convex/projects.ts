import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByOrg = query({
	args: { orgID: v.id('orgs') },
	handler: async (ctx, { orgID }) => {
		return await ctx.db
			.query('projects')
			.withIndex('by_org', (q) => q.eq('orgID', orgID))
			.collect();
	}
});

export const create = mutation({
	args: {
		orgID: v.id('orgs'),
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		createdBY: v.id('users')
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('projects')
			.withIndex('by_org_slug', (q) => q.eq('orgID', args.orgID).eq('slug', args.slug))
			.first();
		if (existing) throw new Error('Project slug already exists in this org');

		return await ctx.db.insert('projects', args);
	}
});

export const addMember = mutation({
	args: { projectID: v.id('projects'), userID: v.id('users') },
	handler: async (ctx, { projectID, userID }) => {
		const existing = await ctx.db
			.query('projectMembers')
			.withIndex('by_project_user', (q) => q.eq('projectID', projectID).eq('userID', userID))
			.first();
		if (existing) return existing._id;

		return await ctx.db.insert('projectMembers', { projectID, userID });
	}
});
