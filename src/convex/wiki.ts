import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listByProjectLatest = query({
  args: { projectID: v.id('projects') },
  handler: async (ctx, { projectID }) => {
    const pages = await ctx.db
      .query('wiki')
      .withIndex('by_project', (q) => q.eq('projectID', projectID))
      .collect();

    return pages.sort((a, b) => b.lastEdited - a.lastEdited);
  },
});

export const upsert = mutation({
  args: {
    projectID: v.id('projects'),
    title: v.string(),
    content: v.string(),
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
  },
});

export const listByProject = query({
  args: { orgSlug: v.string(), projectSlug: v.string() },
  handler: async (ctx, { orgSlug, projectSlug }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) return { project: null, pages: [] as any[] };

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project) return { project: null, pages: [] as any[] };

    const pages = await ctx.db
      .query('wiki')
      .withIndex('by_project', (q) => q.eq('projectID', project._id))
      .collect();

    pages.sort((a, b) => (b.lastEdited ?? 0) - (a.lastEdited ?? 0));

    return {
      project: { _id: project._id, name: project.name, slug: project.slug },
      pages: pages.map((w) => ({
        _id: w._id,
        title: w.title,
        lastEdited: w.lastEdited,
        thumbnail: w.thumbnail,
      })),
    };
  },
});

export const get = query({
  args: { id: v.id('wiki') },
  handler: async (ctx, { id }) => {
    const w = await ctx.db.get(id);
    if (!w) return null;
    return {
      _id: w._id,
      title: w.title,
      content: w.content,
      lastEdited: w.lastEdited,
      projectID: w.projectID,
      thumbnail: w.thumbnail,
    };
  },
});

export const create = mutation({
  args: {
    orgSlug: v.string(),
    projectSlug: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, { orgSlug, projectSlug, title, content, thumbnail }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) throw new Error('Org not found');

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project) throw new Error('Project not found');

    const cleanTitle = title.trim();
    if (!cleanTitle) throw new Error('Title is required');

    // Uniqueness enforcement (Convex has no DB-level unique constraints)
    const existing = await ctx.db
      .query('wiki')
      .withIndex('by_project_title', (q) => q.eq('projectID', project._id).eq('title', cleanTitle))
      .first();
    if (existing) throw new Error('A wiki page with this title already exists');

    const now = Date.now();
    const id = await ctx.db.insert('wiki', {
      projectID: project._id,
      title: cleanTitle,
      content: content ?? '',
      lastEdited: now,
      thumbnail,
    });

    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id('wiki'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, { id, title, content, thumbnail }) => {
    const now = Date.now();
    const updates: any = { lastEdited: now };
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content;
    if (thumbnail !== undefined) updates.thumbnail = thumbnail.trim() || undefined;

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id('wiki') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
