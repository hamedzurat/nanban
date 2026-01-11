import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByProjectLatest = query({
	args: { projectID: v.id('projects') },
	handler: async (ctx, { projectID }) => {
		const pages = await ctx.db
			.query('wiki')
			.withIndex('by_project', (q) => q.eq('projectID', projectID))
			.collect();

		return pages.sort((a, b) => b.lastEdited - a.lastEdited);
	}
});

export const upsert = mutation({
	args: {
		projectID: v.id('projects'),
		title: v.string(),
		content: v.string()
	},
	handler: async (ctx, { projectID, title, content }) => {
		const existing = await ctx.db
			.query('wiki')
			.withIndex('by_project_title', (q) => q.eq('projectID', projectID).eq('title', title))
			.first();

		const now = Date.now();
		if (existing) {
			await ctx.db.patch(existing._id, { content, lastEdited: now });
			return existing._id;
		}

		return await ctx.db.insert('wiki', { projectID, title, content, lastEdited: now });
	}
});
