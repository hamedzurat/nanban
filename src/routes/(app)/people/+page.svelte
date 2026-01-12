<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { api, type Id } from '$lib/convex/api';
  import { session } from '$lib/session';

  type Person = {
    _id: Id<'users'>;
    name: string;
    email: string;
    avatarURL: string | null;
  };

  const client = useConvexClient();

  // no skipping needed; this route is already auth-gated
  const people = useQuery(api.people.listUsers, () => ({}));

  let q = $state('');
  let busyId = $state<string | null>(null);

  function filtered(): Person[] {
    const data = (people.data ?? []) as Person[];
    const me = $session?.userId;
    const needle = q.trim().toLowerCase();

    const rows = me ? data.filter((u) => u._id !== me) : data;
    if (!needle) return rows;

    return rows.filter((u) => (u.name + ' ' + u.email).toLowerCase().includes(needle));
  }

  async function startChat(userId: Id<'users'>) {
    if (!$session) return;
    busyId = `${userId}`;
    try {
      const res = await client.mutation(api.chats.getOrCreateDm, {
        orgSlug: 'zurat',
        userA: $session.userId,
        userB: userId,
      });
      await goto(`/chat?c=${res.chatID}`);
    } finally {
      busyId = null;
    }
  }
</script>

<div class="space-y-4 p-6">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold">People</h1>
      <p class="text-sm text-muted-foreground">All users in the company</p>
    </div>

    <Input class="max-w-sm" placeholder="Search people..." bind:value={q} />
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Directory</Card.Title>
      <Card.Description>
        {#if people.isLoading}Loading…{:else}{filtered().length} people{/if}
      </Card.Description>
    </Card.Header>

    <Card.Content class="p-0">
      {#if people.isLoading}
        <div class="p-6 text-sm text-muted-foreground">Loading…</div>
      {:else if people.error}
        <div class="p-6 text-sm text-destructive">Failed: {people.error.toString()}</div>
      {:else if filtered().length === 0}
        <div class="p-6 text-sm text-muted-foreground">No users found.</div>
      {:else}
        <div class="divide-y">
          {#each filtered() as u (u._id)}
            <div class="flex items-center justify-between gap-4 p-4">
              <div class="flex min-w-0 items-center gap-3">
                <Avatar.Root class="size-9">
                  {#if u.avatarURL}
                    <Avatar.Image src={u.avatarURL} alt={u.name} />
                  {/if}
                  <Avatar.Fallback>{u.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar.Root>

                <div class="min-w-0">
                  <div class="truncate font-medium">{u.name}</div>
                  <div class="truncate text-sm text-muted-foreground">{u.email}</div>
                </div>
              </div>

              <Button variant="outline" disabled={!$session || busyId === `${u._id}`} onclick={() => startChat(u._id)}>
                {#if busyId === `${u._id}`}Opening…{:else}Chat{/if}
              </Button>
            </div>
          {/each}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
