<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import { formatDistanceToNow } from 'date-fns';
  import Fuse from 'fuse.js';

  import { page } from '$app/state';

  import TaskHoverCard from '$lib/components/TaskHoverCard.svelte';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import { Switch } from '$lib/components/ui/switch/index.js';
  import { api } from '$lib/convex/api';
  import { session } from '$lib/session';

  const client = useConvexClient();
  const projectSlug = () => page.params.slug as string;

  const ORG = 'nanban';

  let q = $state('');
  let showAll = $state(false);

  type Quad = 'do' | 'decide' | 'delegate' | 'delete';
  const quads: { key: Quad; title: string; subtitle: string }[] = [
    { key: 'do', title: 'Do', subtitle: 'Important & Urgent' },
    { key: 'decide', title: 'Decide', subtitle: 'Important but Not Urgent' },
    { key: 'delegate', title: 'Delegate', subtitle: 'Urgent but Not Important' },
    { key: 'delete', title: 'Delete', subtitle: 'Neither' },
  ];

  // 4 queries (one per quadrant)
  const doQ = useQuery(api.tasks.listMineByQuadrant, () =>
    $session
      ? {
          orgSlug: ORG,
          projectSlug: projectSlug(),
          userID: $session.userId,
          quadrant: 'do' as const,
        }
      : 'skip',
  );
  const decideQ = useQuery(api.tasks.listMineByQuadrant, () =>
    $session
      ? {
          orgSlug: ORG,
          projectSlug: projectSlug(),
          userID: $session.userId,
          quadrant: 'decide' as const,
        }
      : 'skip',
  );
  const delegateQ = useQuery(api.tasks.listMineByQuadrant, () =>
    $session
      ? {
          orgSlug: ORG,
          projectSlug: projectSlug(),
          userID: $session.userId,
          quadrant: 'delegate' as const,
        }
      : 'skip',
  );
  const deleteQ = useQuery(api.tasks.listMineByQuadrant, () =>
    $session
      ? {
          orgSlug: ORG,
          projectSlug: projectSlug(),
          userID: $session.userId,
          quadrant: 'delete' as const,
        }
      : 'skip',
  );

  function getQ(k: Quad) {
    return k === 'do' ? doQ : k === 'decide' ? decideQ : k === 'delegate' ? delegateQ : deleteQ;
  }

  function fuzzy(list: any[]) {
    // 1. Filter by status if needed
    let filtered = list;
    if (!showAll) {
      filtered = list.filter((t) => t.status === 'todo' || t.status === 'in-progress');
    }

    const needle = q.trim();
    if (!needle) return filtered;
    const fuse = new Fuse(filtered, {
      keys: ['title', 'description', 'status'],
      threshold: 0.35,
      ignoreLocation: true,
    });
    return fuse.search(needle).map((r) => r.item);
  }

  async function setStatus(taskID: any, next: any) {
    await client.mutation(api.tasks.update, { taskID, status: next });
  }
  async function toggleImportant(taskID: any, cur: boolean) {
    await client.mutation(api.tasks.update, { taskID, isImportant: !cur });
  }
  async function toggleUrgent(taskID: any, cur: boolean) {
    await client.mutation(api.tasks.update, { taskID, isUrgent: !cur });
  }
</script>

<div class="space-y-4 p-6">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold">My tasks</h1>
      <p class="text-sm text-muted-foreground">Eisenhower matrix</p>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <Switch id="show-all" bind:checked={showAll} />
        <Label for="show-all">Show all</Label>
      </div>
      <Input class="w-72" placeholder="Search" bind:value={q} />
    </div>
  </div>

  <div class="grid gap-4 lg:grid-cols-2">
    {#each quads as quad (quad.key)}
      {@const rq = getQ(quad.key)}
      <Card.Root class="min-h-72">
        <Card.Header>
          <Card.Title class="flex items-center justify-between">
            <span>{quad.title}</span>
            <Badge variant="secondary">{fuzzy(rq.data?.tasks ?? []).length}</Badge>
          </Card.Title>
          <Card.Description>{quad.subtitle}</Card.Description>
        </Card.Header>

        <Card.Content class="space-y-2">
          {#if rq.isLoading}
            <div class="space-y-2">
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
            </div>
          {:else if rq.error}
            <div class="text-sm text-destructive">{rq.error.toString()}</div>
          {:else if (rq.data?.tasks?.length ?? 0) === 0}
            <div class="text-sm text-muted-foreground">No tasks here.</div>
          {:else}
            <div class="space-y-2">
              {#each fuzzy(rq.data?.tasks ?? []) as t (t._id)}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <TaskHoverCard
                      title={t.title}
                      description={t.description}
                      status={t.status}
                      isImportant={t.isImportant}
                      isUrgent={t.isUrgent}
                    >
                      <div class="cursor-default rounded-md border p-3 transition hover:bg-accent/40">
                        <div class="flex items-start justify-between gap-2">
                          <span class="line-clamp-2 leading-snug font-medium">{t.title}</span>
                          <Badge variant="outline">{t.status}</Badge>
                          {formatDistanceToNow(t.completeBy, { addSuffix: true })}
                        </div>
                      </div>
                    </TaskHoverCard>
                  </ContextMenu.Trigger>

                  <ContextMenu.Content>
                    <ContextMenu.Label>Actions</ContextMenu.Label>
                    <ContextMenu.Separator />

                    <ContextMenu.Sub>
                      <ContextMenu.SubTrigger>Status</ContextMenu.SubTrigger>
                      <ContextMenu.SubContent>
                        <ContextMenu.Item onclick={() => setStatus(t._id, 'backlog')}>Backlog</ContextMenu.Item>
                        <ContextMenu.Item onclick={() => setStatus(t._id, 'todo')}>Todo</ContextMenu.Item>
                        <ContextMenu.Item onclick={() => setStatus(t._id, 'in-progress')}>In progress</ContextMenu.Item>
                        <ContextMenu.Item onclick={() => setStatus(t._id, 'done')}>Done</ContextMenu.Item>
                        <ContextMenu.Item onclick={() => setStatus(t._id, 'canceled')}>Canceled</ContextMenu.Item>
                      </ContextMenu.SubContent>
                    </ContextMenu.Sub>

                    <ContextMenu.Separator />
                    <ContextMenu.Item onclick={() => toggleImportant(t._id, t.isImportant)}>
                      {t.isImportant ? 'Unmark important' : 'Mark important'}
                    </ContextMenu.Item>
                    <ContextMenu.Item onclick={() => toggleUrgent(t._id, t.isUrgent)}>
                      {t.isUrgent ? 'Unmark urgent' : 'Mark urgent'}
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              {/each}
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
