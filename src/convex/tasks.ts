import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

const Status = v.union(
  v.literal('backlog'),
  v.literal('todo'),
  v.literal('in-progress'),
  v.literal('done'),
  v.literal('canceled'),
);

const Quadrant = v.union(
  v.literal('all'),
  v.literal('do'), // important + urgent
  v.literal('decide'), // important + not urgent
  v.literal('delegate'), // urgent + not important
  v.literal('delete'), // neither
);

export const listByProject = query({
  args: { projectID: v.id('projects') },
  handler: async (ctx, { projectID }) => {
    return await ctx.db
      .query('tasks')
      .withIndex('by_project', (q) => q.eq('projectID', projectID))
      .collect();
  },
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
    isUrgent: v.boolean(),
    completeBy: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('tasks', args);
  },
});

export const setStatus = mutation({
  args: { taskID: v.id('tasks'), status: Status },
  handler: async (ctx, { taskID, status }) => {
    await ctx.db.patch(taskID, { status });
  },
});

export const listForKanban = query({
  args: { orgSlug: v.string(), projectSlug: v.string() },
  handler: async (ctx, { orgSlug, projectSlug }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) return { org: null, project: null, tasks: [] as any[] };

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project)
      return {
        org: { _id: org._id, name: org.name, slug: org.slug },
        project: null,
        tasks: [] as any[],
      };

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_project', (q) => q.eq('projectID', project._id))
      .collect();

    const out = [];
    for (const t of tasks) {
      const assignee = await ctx.db.get(t.assigneeID);
      const reporter = await ctx.db.get(t.reporterID);
      out.push({
        _id: t._id,
        projectID: t.projectID,
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        isImportant: t.isImportant,
        isUrgent: t.isUrgent,
        completeBy: t.completeBy,
        assignee: assignee ? { _id: assignee._id, name: assignee.name, avatarURL: assignee.avatarURL ?? null } : null,
        reporter: reporter ? { _id: reporter._id, name: reporter.name } : null,
      });
    }

    return {
      org: { _id: org._id, name: org.name, slug: org.slug },
      project: {
        _id: project._id,
        name: project.name,
        slug: project.slug,
        description: project.description ?? '',
      },
      tasks: out,
    };
  },
});

export const update = mutation({
  args: {
    taskID: v.id('tasks'),
    status: v.optional(Status),
    isImportant: v.optional(v.boolean()),
    isUrgent: v.optional(v.boolean()),
    assigneeID: v.optional(v.id('users')),
  },
  handler: async (ctx, { taskID, ...patch }) => {
    // remove undefined keys
    const next: Record<string, any> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) next[k] = v;
    }
    await ctx.db.patch(taskID, next);
  },
});

export const remove = mutation({
  args: { taskID: v.id('tasks') },
  handler: async (ctx, { taskID }) => {
    await ctx.db.delete(taskID);
  },
});

export const createBySlug = mutation({
  args: {
    orgSlug: v.string(),
    projectSlug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeID: v.id('users'),
    reporterID: v.id('users'),
    isImportant: v.boolean(),
    isUrgent: v.boolean(),
    completeBy: v.number(),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', args.orgSlug))
      .first();
    if (!org) throw new Error('Org not found');

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', args.projectSlug))
      .first();
    if (!project) throw new Error('Project not found');

    const taskID = await ctx.db.insert('tasks', {
      projectID: project._id,
      title: args.title,
      description: args.description ?? '',
      assigneeID: args.assigneeID,
      reporterID: args.reporterID,
      status: 'todo',
      isImportant: args.isImportant,
      isUrgent: args.isUrgent,
      completeBy: args.completeBy,
    });

    return { taskID };
  },
});

// Admin-triggered mutation: move overdue todo tasks to backlog
export const moveOverdueToBacklog = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const todoTasks = await ctx.db
      .query('tasks')
      .filter((q) => q.eq(q.field('status'), 'todo'))
      .collect();

    let movedCount = 0;
    for (const task of todoTasks) {
      if (task.completeBy && task.completeBy < now) {
        await ctx.db.patch(task._id, { status: 'backlog' });
        movedCount++;
      }
    }
    return { movedCount };
  },
});

export const listForTable = query({
  args: { orgSlug: v.string(), projectSlug: v.string() },
  handler: async (ctx, { orgSlug, projectSlug }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) return { project: null, tasks: [] as any[] };

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project) return { project: null, tasks: [] as any[] };

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_project', (q) => q.eq('projectID', project._id))
      .collect();

    const out = [];
    for (const t of tasks) {
      const assignee = await ctx.db.get(t.assigneeID);
      out.push({
        _id: t._id,
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        isImportant: t.isImportant,
        isUrgent: t.isUrgent,
        assignee: assignee ? { _id: assignee._id, name: assignee.name, avatarURL: assignee.avatarURL ?? null } : null,
      });
    }

    // stable order: status then title
    const order: Record<string, number> = {
      backlog: 0,
      todo: 1,
      'in-progress': 2,
      done: 3,
      canceled: 4,
    };
    out.sort((a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title));

    return { project: { _id: project._id, name: project.name, slug: project.slug }, tasks: out };
  },
});

export const countForProject = query({
  args: {
    orgSlug: v.string(),
    projectSlug: v.string(),
    status: v.optional(Status),
    quadrant: v.optional(Quadrant),
    assigneeID: v.optional(v.id('users')),
    reporterID: v.optional(v.id('users')),
  },
  handler: async (ctx, { orgSlug, projectSlug, status, quadrant, assigneeID, reporterID }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) return { count: 0, project: null };

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project) return { count: 0, project: null };

    let q = ctx.db.query('tasks').withIndex('by_project', (qq) => qq.eq('projectID', project._id));

    if (status) {
      q = q.filter((qq) => qq.eq(qq.field('status'), status));
    }

    if (assigneeID) {
      q = q.filter((qq) => qq.eq(qq.field('assigneeID'), assigneeID));
    }

    if (reporterID) {
      q = q.filter((qq) => qq.eq(qq.field('reporterID'), reporterID));
    }

    if (quadrant && quadrant !== 'all') {
      q = q.filter((qq) => {
        const imp = qq.field('isImportant');
        const urg = qq.field('isUrgent');
        if (quadrant === 'do') return qq.and(qq.eq(imp, true), qq.eq(urg, true));
        if (quadrant === 'decide') return qq.and(qq.eq(imp, true), qq.eq(urg, false));
        if (quadrant === 'delegate') return qq.and(qq.eq(imp, false), qq.eq(urg, true));
        return qq.and(qq.eq(imp, false), qq.eq(urg, false));
      });
    }

    const tasks = await q.collect();
    return { count: tasks.length, project: { _id: project._id, name: project.name } };
  },
});

export const listForTablePaginated = query({
  args: {
    orgSlug: v.string(),
    projectSlug: v.string(),
    status: v.optional(Status),
    quadrant: v.optional(Quadrant),
    assigneeID: v.optional(v.id('users')),
    reporterID: v.optional(v.id('users')),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { orgSlug, projectSlug, status, quadrant, assigneeID, reporterID, paginationOpts }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) return { project: null, page: [], isDone: true, continueCursor: null as string | null };

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project) return { project: null, page: [], isDone: true, continueCursor: null as string | null };

    let q = ctx.db.query('tasks').withIndex('by_project', (qq) => qq.eq('projectID', project._id));

    if (status) {
      q = q.filter((qq) => qq.eq(qq.field('status'), status));
    }

    if (assigneeID) {
      q = q.filter((qq) => qq.eq(qq.field('assigneeID'), assigneeID));
    }

    if (reporterID) {
      q = q.filter((qq) => qq.eq(qq.field('reporterID'), reporterID));
    }

    if (quadrant && quadrant !== 'all') {
      q = q.filter((qq) => {
        const imp = qq.field('isImportant');
        const urg = qq.field('isUrgent');
        if (quadrant === 'do') return qq.and(qq.eq(imp, true), qq.eq(urg, true));
        if (quadrant === 'decide') return qq.and(qq.eq(imp, true), qq.eq(urg, false));
        if (quadrant === 'delegate') return qq.and(qq.eq(imp, false), qq.eq(urg, true));
        return qq.and(qq.eq(imp, false), qq.eq(urg, false)); // delete
      });
    }

    // paginate returns page + cursor info
    const { page, isDone, continueCursor } = await q.order('desc').paginate(paginationOpts);

    const out = [];
    for (const t of page) {
      const assignee = await ctx.db.get(t.assigneeID);
      const reporter = await ctx.db.get(t.reporterID);
      out.push({
        _id: t._id,
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        isImportant: t.isImportant,
        isUrgent: t.isUrgent,
        completeBy: t.completeBy,
        assignee: assignee ? { _id: assignee._id, name: assignee.name, avatarURL: assignee.avatarURL ?? null } : null,
        reporter: reporter ? { _id: reporter._id, name: reporter.name, avatarURL: reporter.avatarURL ?? null } : null,
      });
    }

    return {
      project: { _id: project._id, name: project.name, slug: project.slug },
      page: out,
      isDone,
      continueCursor,
    };
  },
});

export const listMineByQuadrantPaginated = query({
  args: {
    orgSlug: v.string(),
    projectSlug: v.string(),
    userID: v.id('users'),
    quadrant: Quadrant,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { orgSlug, projectSlug, userID, quadrant, paginationOpts }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) return { project: null, page: [], isDone: true, continueCursor: null as string | null };

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project) return { project: null, page: [], isDone: true, continueCursor: null as string | null };

    // use the index we added
    let q = ctx.db
      .query('tasks')
      .withIndex('by_project_assignee', (qq) => qq.eq('projectID', project._id).eq('assigneeID', userID));

    // quadrant filter
    q = q.filter((qq) => {
      const imp = qq.field('isImportant');
      const urg = qq.field('isUrgent');
      if (quadrant === 'do') return qq.and(qq.eq(imp, true), qq.eq(urg, true));
      if (quadrant === 'decide') return qq.and(qq.eq(imp, true), qq.eq(urg, false));
      if (quadrant === 'delegate') return qq.and(qq.eq(imp, false), qq.eq(urg, true));
      return qq.and(qq.eq(imp, false), qq.eq(urg, false)); // delete
    });

    // paginate (cursor-based)
    const { page, isDone, continueCursor } = await q.order('desc').paginate(paginationOpts);

    // hydrate assignee (optional, but nice)
    const out = [];
    for (const t of page) {
      out.push({
        _id: t._id,
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        isImportant: t.isImportant,
        isUrgent: t.isUrgent,
      });
    }

    return {
      project: { _id: project._id, name: project.name, slug: project.slug },
      page: out,
      isDone,
      continueCursor,
    };
  },
});

export const listMineByQuadrant = query({
  args: {
    orgSlug: v.string(),
    projectSlug: v.string(),
    userID: v.id('users'),
    quadrant: Quadrant,
  },
  handler: async (ctx, { orgSlug, projectSlug, userID, quadrant }) => {
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .first();
    if (!org) return { project: null, tasks: [] };

    const project = await ctx.db
      .query('projects')
      .withIndex('by_org_slug', (q) => q.eq('orgID', org._id).eq('slug', projectSlug))
      .first();
    if (!project) return { project: null, tasks: [] };

    let q = ctx.db
      .query('tasks')
      .withIndex('by_project_assignee', (qq) => qq.eq('projectID', project._id).eq('assigneeID', userID));

    q = q.filter((qq) => {
      const imp = qq.field('isImportant');
      const urg = qq.field('isUrgent');
      if (quadrant === 'do') return qq.and(qq.eq(imp, true), qq.eq(urg, true));
      if (quadrant === 'decide') return qq.and(qq.eq(imp, true), qq.eq(urg, false));
      if (quadrant === 'delegate') return qq.and(qq.eq(imp, false), qq.eq(urg, true));
      return qq.and(qq.eq(imp, false), qq.eq(urg, false));
    });

    const tasks = await q.order('desc').collect();

    const out = [];
    for (const t of tasks) {
      out.push({
        _id: t._id,
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        isImportant: t.isImportant,
        isUrgent: t.isUrgent,
        completeBy: t.completeBy,
      });
    }

    return {
      project: { _id: project._id, name: project.name, slug: project.slug },
      tasks: out,
    };
  },
});
