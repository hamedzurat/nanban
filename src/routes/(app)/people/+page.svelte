<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import Fuse from 'fuse.js';

  import { goto } from '$app/navigation';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
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

  const availablePeople = $derived.by(() => {
    const data = (people.data ?? []) as Person[];
    const me = $session?.userId;
    return me ? data.filter((u) => u._id !== me) : data;
  });

  const fuse = $derived(
    new Fuse(availablePeople, {
      keys: ['name', 'email'],
      threshold: 0.4,
    }),
  );

  const filtered = $derived.by(() => {
    const needle = q.trim();
    if (!needle) return availablePeople;
    return fuse.search(needle).map((r) => r.item);
  });

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
      <div class="flex items-center justify-between">
        <Card.Title>Directory</Card.Title>
        <div class="text-sm text-muted-foreground">
          {#if people.isLoading}
            <div class="flex items-center gap-2">
              <Skeleton class="h-4 w-4 rounded-full" />
              <Skeleton class="h-4 w-24" />
            </div>
          {:else}
            <Badge variant="secondary">{filtered.length} peoples</Badge>
          {/if}
        </div>
      </div>
    </Card.Header>

    <Card.Content class="p-0">
      {#if people.isLoading}
        <div class="divide-y">
          {#each Array(16) as _}
            <div class="flex items-center justify-between gap-4 p-4">
              <div class="flex min-w-0 items-center gap-3">
                <Skeleton class="size-9 rounded-full" />
                <div class="space-y-2">
                  <Skeleton class="h-4 w-[150px]" />
                  <Skeleton class="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton class="h-9 w-[70px]" />
            </div>
          {/each}
        </div>
      {:else if people.error}
        <div class="p-6 text-sm text-destructive">Failed: {people.error.toString()}</div>
      {:else if filtered.length === 0}
        <div class="p-6 text-sm text-muted-foreground">No users found.</div>
      {:else}
        <div class="divide-y">
          {#each filtered as u (u._id)}
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

              <Button disabled={!$session || busyId === `${u._id}`} onclick={() => startChat(u._id)}>
                {#if busyId === `${u._id}`}Opening…{:else}Chat{/if}
              </Button>
            </div>
          {/each}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
