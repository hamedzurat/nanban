import { query } from './_generated/server';

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    users.sort((a, b) => a.name.localeCompare(b.name));
    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      avatarURL: u.avatarURL ?? null,
    }));
  },
});
