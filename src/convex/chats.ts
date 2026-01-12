import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

const ChatType = v.union(v.literal('dm'), v.literal('ai'), v.literal('group'));

export const listByOrg = query({
  args: { orgID: v.id('orgs') },
  handler: async (ctx, { orgID }) => {
    return await ctx.db
      .query('chats')
      .withIndex('by_org', (q) => q.eq('orgID', orgID))
      .collect();
  },
});

// idempotent create by (orgID, type, name)
export const create = mutation({
  args: { orgID: v.id('orgs'), name: v.string(), type: ChatType },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('chats')
      .withIndex('by_org_type_name', (q) => q.eq('orgID', args.orgID).eq('type', args.type).eq('name', args.name))
      .first();

    if (existing) return existing._id;
    return await ctx.db.insert('chats', args);
  },
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
  },
});

export const getOrCreateDm = mutation({
  args: {
    orgSlug: v.string(),
    userA: v.id('users'),
    userB: v.id('users'),
  },
  handler: async (ctx, { orgSlug, userA, userB }) => {
    if (userA === userB) throw new Error('Cannot DM yourself');

    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) throw new Error('Org not found');

    // stable unique key for the pair
    const [a, b] = [`${userA}`, `${userB}`].sort();
    const dmKey = `dm:${a}:${b}`;

    const existing = await ctx.db
      .query('chats')
      .withIndex('by_org_type_name', (q) => q.eq('orgID', org._id).eq('type', 'dm').eq('name', dmKey))
      .first();

    const chatID: Id<'chats'> =
      existing?._id ??
      (await ctx.db.insert('chats', {
        orgID: org._id,
        type: 'dm',
        name: dmKey,
      }));

    // ensure participants exist
    for (const userID of [userA, userB]) {
      const cp = await ctx.db
        .query('chatParticipants')
        .withIndex('by_chat_user', (q) => q.eq('chatID', chatID).eq('userID', userID))
        .first();
      if (!cp) await ctx.db.insert('chatParticipants', { chatID, userID });
    }

    return { chatID };
  },
});

export const inbox = query({
  args: {
    orgSlug: v.string(),
    userID: v.id('users'),
  },
  handler: async (ctx, { orgSlug, userID }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();

    if (!org) return [];

    // all chats this user participates in
    const parts = await ctx.db
      .query('chatParticipants')
      .withIndex('by_user', (q) => q.eq('userID', userID))
      .collect();

    if (parts.length === 0) return [];

    const rows: Array<{
      chatID: Id<'chats'>;
      type: 'dm' | 'ai' | 'group';
      displayName: string;
      otherUserID: Id<'users'> | null;
    }> = [];

    for (const p of parts) {
      const chat = await ctx.db.get(p.chatID);
      if (!chat) continue;
      if (`${chat.orgID}` !== `${org._id}`) continue;

      let displayName = chat.name;
      let otherUserID: Id<'users'> | null = null;

      if (chat.type === 'dm') {
        // name is stored like: dm:<idA>:<idB>
        const m = /^dm:([^:]+):([^:]+)$/.exec(chat.name);
        if (m) {
          const a = m[1] as unknown as Id<'users'>;
          const b = m[2] as unknown as Id<'users'>;
          otherUserID = `${a}` === `${userID}` ? b : a;

          const other = await ctx.db.get(otherUserID);
          displayName = other?.name ?? 'Direct message';
        } else {
          displayName = 'Direct message';
        }
      }

      rows.push({ chatID: chat._id, type: chat.type, displayName, otherUserID });
    }

    // alphabetical order in sidebar (your requirement)
    rows.sort((a, b) => a.displayName.localeCompare(b.displayName));
    return rows;
  },
});
