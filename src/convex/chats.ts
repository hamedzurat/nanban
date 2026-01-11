import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const ChatType = v.union(v.literal('dm'), v.literal('ai'), v.literal('group'));

export const listByOrg = query({
	args: { orgID: v.id('orgs') },
	handler: async (ctx, { orgID }) => {
		return await ctx.db
			.query('chats')
			.withIndex('by_org', (q) => q.eq('orgID', orgID))
			.collect();
	}
});

// idempotent create by (orgID, type, name)
export const create = mutation({
	args: { orgID: v.id('orgs'), name: v.string(), type: ChatType },
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('chats')
			.withIndex('by_org_type_name', (q) =>
				q.eq('orgID', args.orgID).eq('type', args.type).eq('name', args.name)
			)
			.first();

		if (existing) return existing._id;
		return await ctx.db.insert('chats', args);
	}
});

export const addParticipant = mutation({
	args: { chatID: v.id('chats'), userID: v.id('users') },
	handler: async (ctx, { chatID, userID }) => {
		const existing = await ctx.db
			.query('chatParticipants')
			.withIndex('by_chat_user', (q) => q.eq('chatID', chatID).eq('userID', userID))
			.first();

		if (existing) return existing._id;
		return await ctx.db.insert('chatParticipants', { chatID, userID });
	}
});
