/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules, FilterApi, FunctionReference } from 'convex/server';

import type * as auth from '../auth.js';
import type * as chats from '../chats.js';
import type * as dashboard from '../dashboard.js';
import type * as messages from '../messages.js';
import type * as orgs from '../orgs.js';
import type * as people from '../people.js';
import type * as projects from '../projects.js';
import type * as seed from '../seed.js';
import type * as tasks from '../tasks.js';
import type * as users from '../users.js';
import type * as wiki from '../wiki.js';

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chats: typeof chats;
  dashboard: typeof dashboard;
  messages: typeof messages;
  orgs: typeof orgs;
  people: typeof people;
  projects: typeof projects;
  seed: typeof seed;
  tasks: typeof tasks;
  users: typeof users;
  wiki: typeof wiki;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, 'public'>>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, 'internal'>>;

export declare const components: {};
