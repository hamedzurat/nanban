import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const Status = v.union(
	v.literal('backlog'),
	v.literal('todo'),
	v.literal('in-progress'),
	v.literal('done'),
	v.literal('canceled')
);

export const listByProject = query({
	args: { projectID: v.id('projects') },
	handler: async (ctx, { projectID }) => {
		return await ctx.db
			.query('tasks')
			.withIndex('by_project', (q) => q.eq('projectID', projectID))
			.collect();
	}
});

export const create = mutation({
	args: {
		projectID: v.id('projects'),
		title: v.string(),
		description: v.optional(v.string()),
		assigneeID: v.id('users'),
		reporterID: v.id('users'),
		status: Status,
		isImportant: v.boolean(),
		isUrgent: v.boolean()
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('tasks', args);
	}
});

export const setStatus = mutation({
	args: { taskID: v.id('tasks'), status: Status },
	handler: async (ctx, { taskID, status }) => {
		await ctx.db.patch(taskID, { status });
	}
});
