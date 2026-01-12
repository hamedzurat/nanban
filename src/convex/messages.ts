import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listByChat = query({
  args: { chatID: v.id('chats') },
  handler: async (ctx, { chatID }) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_chat_time', (q) => q.eq('chatID', chatID))
      .collect();
  },
});

export const send = mutation({
  args: { chatID: v.id('chats'), senderID: v.id('users'), body: v.string() },
  handler: async (ctx, { chatID, senderID, body }) => {
    return await ctx.db.insert('messages', { chatID, senderID, body, time: Date.now() });
  },
});
