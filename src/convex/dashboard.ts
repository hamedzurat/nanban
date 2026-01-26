import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { query } from './_generated/server';

type Status = 'backlog' | 'todo' | 'in-progress' | 'done' | 'canceled';

export const company = query({
  args: { orgSlug: v.string() },
  handler: async (ctx, { orgSlug }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();

    if (!org) {
      return { org: null, projects: [] as any[] };
    }

    const projects = await ctx.db
      .query('projects')
      .withIndex('by_org', (q) => q.eq('orgID', org._id))
      .collect();

    const result = [];
    for (const project of projects) {
      const tasks = await ctx.db
        .query('tasks')
        .withIndex('by_project', (q) => q.eq('projectID', project._id))
        .collect();

      const counts: Record<Status, number> = {
        backlog: 0,
        todo: 0,
        'in-progress': 0,
        done: 0,
        canceled: 0,
      };
      for (const t of tasks) counts[t.status as Status]++;

      const total = tasks.length;
      const done = counts.done;
      const completion = total === 0 ? 0 : Math.round((done / total) * 100);

      const members = await ctx.db
        .query('projectMembers')
        .withIndex('by_project', (q) => q.eq('projectID', project._id))
        .collect();

      const memberUsers = [];
      for (const m of members) {
        const u = await ctx.db.get(m.userID as Id<'users'>);
        if (u) memberUsers.push({ _id: u._id, name: u.name, email: u.email, avatarURL: u.avatarURL ?? null });
      }

      result.push({
        _id: project._id,
        name: project.name,
        slug: project.slug,
        description: project.description ?? '',
        completion,
        counts,
        members: memberUsers,
      });
    }

    // nice stable order
    result.sort((a, b) => a.name.localeCompare(b.name));

    return {
      org: { _id: org._id, name: org.name, slug: org.slug },
      projects: result,
    };
  },
});
