import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    avatarURL: v.optional(v.string()),
  })
    .index('by_email', ['email'])
    .index('by_name', ['name']),

  orgs: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index('by_slug', ['slug']),

  projects: defineTable({
    orgID: v.id('orgs'),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    createdBY: v.id('users'),
  })
    .index('by_org', ['orgID'])
    .index('by_org_slug', ['orgID', 'slug']),

  projectMembers: defineTable({
    projectID: v.id('projects'),
    userID: v.id('users'),
  })
    .index('by_project', ['projectID'])
    .index('by_user', ['userID'])
    .index('by_project_user', ['projectID', 'userID']),

  tasks: defineTable({
    projectID: v.id('projects'),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeID: v.id('users'),
    reporterID: v.id('users'),
    status: v.union(
      v.literal('backlog'),
      v.literal('todo'),
      v.literal('in-progress'),
      v.literal('done'),
      v.literal('canceled'),
    ),
    isImportant: v.boolean(),
    isUrgent: v.boolean(),
    completeBy: v.optional(v.number()), // Due date timestamp
  })
    .index('by_project', ['projectID'])
    .index('by_project_status', ['projectID', 'status'])
    .index('by_assignee', ['assigneeID'])
    .index('by_project_assignee', ['projectID', 'assigneeID']),

  wiki: defineTable({
    projectID: v.id('projects'),
    title: v.string(),
    content: v.string(),
    lastEdited: v.number(), // Date.now()
  })
    .index('by_project', ['projectID'])
    .index('by_project_title', ['projectID', 'title'])
    .index('by_project_lastEdited', ['projectID', 'lastEdited']),

  chats: defineTable({
    orgID: v.id('orgs'),
    name: v.string(),
    type: v.union(v.literal('dm'), v.literal('ai'), v.literal('group')),
  })
    .index('by_org', ['orgID'])
    .index('by_org_type', ['orgID', 'type'])
    .index('by_org_type_name', ['orgID', 'type', 'name']),

  chatParticipants: defineTable({
    chatID: v.id('chats'),
    userID: v.id('users'),
  })
    .index('by_chat', ['chatID'])
    .index('by_user', ['userID'])
    .index('by_chat_user', ['chatID', 'userID']),

  messages: defineTable({
    chatID: v.id('chats'),
    senderID: v.id('users'),
    body: v.string(),
    time: v.number(), // Date.now()
  })
    .index('by_chat', ['chatID'])
    .index('by_chat_time', ['chatID', 'time']),
});
