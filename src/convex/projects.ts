import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listByOrg = query({
  args: { orgID: v.id('orgs') },
  handler: async (ctx, { orgID }) => {
    return await ctx.db
      .query('projects')
      .withIndex('by_org', (q) => q.eq('orgID', orgID))
      .collect();
  },
});

export const create = mutation({
  args: {
    orgID: v.id('orgs'),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    createdBY: v.id('users'),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', args.orgID).eq('slug', args.slug))
      .first();
    if (existing) throw new Error('Project slug already exists in this org');

    return await ctx.db.insert('projects', args);
  },
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
  },
});

export const listForSidebar = query({
  args: { orgSlug: v.string() },
  handler: async (ctx, { orgSlug }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();

    if (!org) return [];

    const projects = await ctx.db
      .query('projects')
      .withIndex('by_org', (q) => q.eq('orgID', org._id))
      .collect();

    projects.sort((a, b) => a.name.localeCompare(b.name));
    return projects.map((p) => ({ _id: p._id, name: p.name, slug: p.slug }));
  },
});

export const membersBySlug = query({
  args: { orgSlug: v.string(), projectSlug: v.string() },
  handler: async (ctx, { orgSlug, projectSlug }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) return { project: null, members: [] as any[] };

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project) return { project: null, members: [] as any[] };

    const pm = await ctx.db
      .query('projectMembers')
      .withIndex('by_project', (q) => q.eq('projectID', project._id))
      .collect();

    const members = [];
    for (const m of pm) {
      const u = await ctx.db.get(m.userID);
      if (u) members.push({ _id: u._id, name: u.name, avatarURL: u.avatarURL ?? null });
    }
    members.sort((a, b) => a.name.localeCompare(b.name));

    return {
      project: { _id: project._id, name: project.name, slug: project.slug },
      members,
    };
  },
});
