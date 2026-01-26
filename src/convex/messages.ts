import { v } from 'convex/values';

import type { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const listByChat = query({
  args: { chatID: v.id('chats') },
  handler: async (ctx, { chatID }) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_chat_time', (q) => q.eq('chatID', chatID))
      .collect();

    return await Promise.all(
      messages.map(async (m) => {
        const sender = (await ctx.db.get(m.senderID)) as Doc<'users'> | null;
        return {
          ...m,
          sender: sender
            ? {
                name: sender.name,
                avatarURL: sender.avatarURL,
              }
            : null,
        };
      }),
    );
  },
});

export const send = mutation({
  args: { chatID: v.id('chats'), senderID: v.id('users'), body: v.string() },
  handler: async (ctx, { chatID, senderID, body }) => {
    return await ctx.db.insert('messages', { chatID, senderID, body, time: Date.now() });
  },
});
