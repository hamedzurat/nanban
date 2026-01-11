import { mutation } from './_generated/server';
import { v } from 'convex/values';
import type { DataModel, Id } from './_generated/dataModel';

// Helpers
type TableName = keyof DataModel;

async function clearTable(ctx: { db: any }, table: TableName) {
	const docs = await ctx.db.query(table).collect();
	for (const doc of docs) {
		await ctx.db.delete(doc._id);
	}
}

function avatar(i: number) {
	return `https://api.dicebear.com/9.x/identicon/svg?seed=nanban-${i}`;
}

export const run = mutation({
	args: {
		wipe: v.optional(v.boolean()),
		force: v.optional(v.boolean())
	},
	handler: async (ctx, { wipe = false, force = false }) => {
		if (wipe) {
			await clearTable(ctx, 'messages');
			await clearTable(ctx, 'chatParticipants');
			await clearTable(ctx, 'chats');
			await clearTable(ctx, 'wiki');
			await clearTable(ctx, 'tasks');
			await clearTable(ctx, 'projectMembers');
			await clearTable(ctx, 'projects');
			await clearTable(ctx, 'orgs');
			await clearTable(ctx, 'users');
		}

		const hasAnyUser = await ctx.db.query('users').first();
		if (hasAnyUser && !force) {
			return {
				ok: true as const,
				skipped: true as const,
				reason: 'Already seeded (pass force:true or wipe:true)'
			};
		}

		// ORG
		const orgSlug = 'zurat';
		const existingOrg = await ctx.db
			.query('orgs')
			.withIndex('by_slug', (q: any) => q.eq('slug', orgSlug))
			.first();

		const orgID: Id<'orgs'> =
			existingOrg?._id ?? (await ctx.db.insert('orgs', { name: 'Zurat, Inc.', slug: orgSlug }));

		// USERS
		const userDefs = [
			{ name: 'Aisha Rahman', email: 'aisha@zurat.dev' },
			{ name: 'Aminul Islam', email: 'aminul@zurat.dev' },
			{ name: 'Arif Hasan', email: 'arif@zurat.dev' },
			{ name: 'Farhana Akter', email: 'farhana@zurat.dev' },
			{ name: 'Hasib Chowdhury', email: 'hasib@zurat.dev' },
			{ name: 'Ishrat Jahan', email: 'ishrat@zurat.dev' },
			{ name: 'Jubayer Hossain', email: 'jubayer@zurat.dev' },
			{ name: 'Mahmud Hasan', email: 'mahmud@zurat.dev' },
			{ name: 'Nusrat Karim', email: 'nusrat@zurat.dev' },
			{ name: 'Rafi Ahmed', email: 'rafi@zurat.dev' },
			{ name: 'Sadia Sultana', email: 'sadia@zurat.dev' },
			{ name: 'Tanvir Rahman', email: 'tanvir@zurat.dev' }
		] as const;

		const users: Record<(typeof userDefs)[number]['email'], Id<'users'>> = {} as any;

		for (let i = 0; i < userDefs.length; i++) {
			const u = userDefs[i];

			const existing = await ctx.db
				.query('users')
				.withIndex('by_email', (q: any) => q.eq('email', u.email))
				.first();

			const userID: Id<'users'> =
				existing?._id ??
				(await ctx.db.insert('users', {
					name: u.name,
					email: u.email,
					password: 'password123',
					avatarURL: avatar(i + 1)
				}));

			users[u.email] = userID;
		}

		const creatorID: Id<'users'> = users['aisha@zurat.dev'];

		// PROJECTS
		const projectsDef = [
			{
				name: 'Nanban Core',
				slug: 'nanban-core',
				description: 'Core app and platform foundations.'
			},
			{
				name: 'Ops & Delivery',
				slug: 'ops-delivery',
				description: 'Internal ops, process, delivery tracking.'
			},
			{
				name: 'Client Success',
				slug: 'client-success',
				description: 'Customer onboarding, retention, support.'
			},
			{ name: 'R&D Lab', slug: 'rnd-lab', description: 'Experiments, prototypes, exploration.' }
		] as const;

		const projectIDs: Record<(typeof projectsDef)[number]['slug'], Id<'projects'>> = {} as any;

		for (const p of projectsDef) {
			const existing = await ctx.db
				.query('projects')
				.withIndex('by_org_slug', (q: any) => q.eq('orgID', orgID).eq('slug', p.slug))
				.first();

			const projectID: Id<'projects'> =
				existing?._id ??
				(await ctx.db.insert('projects', {
					orgID,
					name: p.name,
					slug: p.slug,
					description: p.description,
					createdBY: creatorID
				}));

			projectIDs[p.slug] = projectID;
		}

		const allUserIds = Object.values(users) as Id<'users'>[];
		const projectSlugs = Object.keys(projectIDs) as Array<keyof typeof projectIDs>;

		// PROJECT MEMBERS
		for (const slug of projectSlugs) {
			const projectID = projectIDs[slug];

			const memberIds =
				slug === 'nanban-core'
					? allUserIds
					: allUserIds.filter((_, idx) => (idx + String(slug).length) % 2 === 0);

			for (const userID of memberIds) {
				const existing = await ctx.db
					.query('projectMembers')
					.withIndex('by_project_user', (q: any) =>
						q.eq('projectID', projectID).eq('userID', userID)
					)
					.first();
				if (!existing) {
					await ctx.db.insert('projectMembers', { projectID, userID });
				}
			}
		}

		// TASKS
		const statuses = ['backlog', 'todo', 'in-progress', 'done', 'canceled'] as const;
		function pick<T>(arr: readonly T[], n: number): T {
			return arr[n % arr.length];
		}

		let taskCount = 0;

		for (const slug of projectSlugs) {
			const projectID = projectIDs[slug];

			const memberDocs = await ctx.db
				.query('projectMembers')
				.withIndex('by_project', (q: any) => q.eq('projectID', projectID))
				.collect();

			const memberUserIds = memberDocs.map((m: any) => m.userID) as Id<'users'>[];

			const baseTitles = [
				'Design login UX polish',
				'Add task creation form',
				'Implement Kanban view rendering',
				'Create wiki markdown viewer',
				'Add chat inbox list',
				'Set up project dashboard cards',
				'Add filtering + search for tasks',
				'Improve sidebar navigation groups',
				'Add status badges and hover cards',
				'Wire project member avatars',
				'Add basic settings stub',
				'Write onboarding docs in wiki'
			] as const;

			for (let i = 0; i < 40; i++) {
				const assigneeID = pick(memberUserIds, i + String(slug).length);
				const reporterID = creatorID;

				await ctx.db.insert('tasks', {
					projectID,
					title: `${pick(baseTitles, i)} (${slug})`,
					description:
						`Context: ${slug}\n\n` +
						`Acceptance:\n- Works with empty state\n- Simple UI\n- No crashes\n\n` +
						`Notes: seeded task #${i + 1} for ${slug}`,
					assigneeID,
					reporterID,
					status: pick(statuses, i * 7 + String(slug).length),
					isImportant: i % 5 === 0,
					isUrgent: i % 7 === 0
				});

				taskCount++;
			}
		}

		// WIKI
		for (const slug of projectSlugs) {
			const projectID = projectIDs[slug];
			const wikiTitles = [
				'Overview',
				'How we work',
				'Release checklist',
				'Onboarding',
				'Project glossary',
				'Meeting notes'
			] as const;

			for (let i = 0; i < wikiTitles.length; i++) {
				const title = wikiTitles[i];

				const existing = await ctx.db
					.query('wiki')
					.withIndex('by_project_title', (q: any) =>
						q.eq('projectID', projectID).eq('title', title)
					)
					.first();
				if (existing) continue;

				const lastEdited = Date.now() - i * 86400000;
				const content = `# ${title}\n\nSeeded wiki page for **${slug}**.\n\n- Item A\n- Item B\n\n_Last edited: ${new Date(lastEdited).toISOString()}_`;

				await ctx.db.insert('wiki', { projectID, title, content, lastEdited });
			}
		}

		// CHATS (Everyone + AI)
		const existingEveryone = await ctx.db
			.query('chats')
			.withIndex('by_org_type_name', (q: any) =>
				q.eq('orgID', orgID).eq('type', 'group').eq('name', 'Everyone')
			)
			.first();

		const everyoneChatId: Id<'chats'> =
			existingEveryone?._id ??
			(await ctx.db.insert('chats', { orgID, type: 'group', name: 'Everyone' }));

		const existingAI = await ctx.db
			.query('chats')
			.withIndex('by_org_type_name', (q: any) =>
				q.eq('orgID', orgID).eq('type', 'ai').eq('name', 'AI')
			)
			.first();

		const aiChatId: Id<'chats'> =
			existingAI?._id ?? (await ctx.db.insert('chats', { orgID, type: 'ai', name: 'AI' }));

		// participants: all users for Everyone + AI
		for (const userID of allUserIds) {
			const ep = await ctx.db
				.query('chatParticipants')
				.withIndex('by_chat_user', (q: any) => q.eq('chatID', everyoneChatId).eq('userID', userID))
				.first();
			if (!ep) await ctx.db.insert('chatParticipants', { chatID: everyoneChatId, userID });

			const ap = await ctx.db
				.query('chatParticipants')
				.withIndex('by_chat_user', (q: any) => q.eq('chatID', aiChatId).eq('userID', userID))
				.first();
			if (!ap) await ctx.db.insert('chatParticipants', { chatID: aiChatId, userID });
		}

		// DMs
		const dmPairs = [
			['aisha@zurat.dev', 'aminul@zurat.dev'],
			['aisha@zurat.dev', 'arif@zurat.dev'],
			['farhana@zurat.dev', 'hasib@zurat.dev'],
			['ishrat@zurat.dev', 'jubayer@zurat.dev'],
			['mahmud@zurat.dev', 'nusrat@zurat.dev']
		] as const;

		const dmChatIds: Id<'chats'>[] = [];

		for (const [a, b] of dmPairs) {
			const name = [a, b].sort().join(' ↔ ');

			const existing = await ctx.db
				.query('chats')
				.withIndex('by_org_type_name', (q: any) =>
					q.eq('orgID', orgID).eq('type', 'dm').eq('name', name)
				)
				.first();

			const chatID: Id<'chats'> =
				existing?._id ?? (await ctx.db.insert('chats', { orgID, type: 'dm', name }));

			dmChatIds.push(chatID);

			for (const userID of [users[a], users[b]]) {
				const cp = await ctx.db
					.query('chatParticipants')
					.withIndex('by_chat_user', (q: any) => q.eq('chatID', chatID).eq('userID', userID))
					.first();
				if (!cp) await ctx.db.insert('chatParticipants', { chatID, userID });
			}
		}

		// MESSAGES
		const now = Date.now();

		for (let i = 0; i < 25; i++) {
			const senderID = allUserIds[i % allUserIds.length];
			await ctx.db.insert('messages', {
				chatID: everyoneChatId,
				senderID,
				body: `Everyone chat seeded message #${i + 1}`,
				time: now - (25 - i) * 60000
			});
		}

		for (let i = 0; i < 10; i++) {
			const senderID = allUserIds[i % allUserIds.length];
			await ctx.db.insert('messages', {
				chatID: aiChatId,
				senderID,
				body: `AI: Example prompt #${i + 1} (dummy)`,
				time: now - (10 - i) * 90000
			});
		}

		for (let c = 0; c < dmChatIds.length; c++) {
			const chatID = dmChatIds[c];
			const [a, b] = dmPairs[c];
			const aID = users[a];
			const bID = users[b];

			for (let i = 0; i < 8; i++) {
				const senderID = i % 2 === 0 ? aID : bID;
				await ctx.db.insert('messages', {
					chatID,
					senderID,
					body: `DM seeded message #${i + 1}`,
					time: now - (8 - i) * 120000 - c * 10000
				});
			}
		}

		return {
			ok: true as const,
			skipped: false as const,
			orgID,
			users: userDefs.length,
			projects: projectsDef.length,
			tasks: taskCount,
			chats: 2 + dmChatIds.length
		};
	}
});
