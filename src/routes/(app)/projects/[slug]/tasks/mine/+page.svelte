<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import Fuse from 'fuse.js';

  import { page } from '$app/state';

  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
  import * as HoverCard from '$lib/components/ui/hover-card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Pagination from '$lib/components/ui/pagination/index.js';
  import { api } from '$lib/convex/api';
  import { session } from '$lib/session';

  const client = useConvexClient();
  const projectSlug = () => page.params.slug as string;

  const ORG = 'nanban';
  const PER_QUADRANT = 15;

  let q = $state('');

  type Quad = 'do' | 'decide' | 'delegate' | 'delete';
  const quads: { key: Quad; title: string; subtitle: string }[] = [
    { key: 'do', title: 'Do', subtitle: 'Important + Urgent' },
    { key: 'decide', title: 'Decide', subtitle: 'Important, not urgent' },
    { key: 'delegate', title: 'Delegate', subtitle: 'Urgent, not important' },
    { key: 'delete', title: 'Delete', subtitle: 'Neither' },
  ];

  // cursor stacks per quadrant (Prev/Next)
  let state = $state<Record<Quad, { pageIndex: number; cursor: string | null; stack: (string | null)[] }>>({
    do: { pageIndex: 1, cursor: null, stack: [null] },
    decide: { pageIndex: 1, cursor: null, stack: [null] },
    delegate: { pageIndex: 1, cursor: null, stack: [null] },
    delete: { pageIndex: 1, cursor: null, stack: [null] },
  });

  function resetQuadrant(k: Quad) {
    state[k] = { pageIndex: 1, cursor: null, stack: [null] };
  }

  // 4 paginated queries (one per quadrant) — each returns {page,isDone,continueCursor}
  const doQ = useQuery(api.tasks.listMineByQuadrantPaginated, () =>
    $session
      ? {
          orgSlug: ORG,
          projectSlug: projectSlug(),
          userID: $session.userId,
          quadrant: 'do',
          paginationOpts: { numItems: PER_QUADRANT, cursor: state.do.cursor },
        }
      : 'skip',
  );
  const decideQ = useQuery(api.tasks.listMineByQuadrantPaginated, () =>
    $session
      ? {
          orgSlug: ORG,
          projectSlug: projectSlug(),
          userID: $session.userId,
          quadrant: 'decide',
          paginationOpts: { numItems: PER_QUADRANT, cursor: state.decide.cursor },
        }
      : 'skip',
  );
  const delegateQ = useQuery(api.tasks.listMineByQuadrantPaginated, () =>
    $session
      ? {
          orgSlug: ORG,
          projectSlug: projectSlug(),
          userID: $session.userId,
          quadrant: 'delegate',
          paginationOpts: { numItems: PER_QUADRANT, cursor: state.delegate.cursor },
        }
      : 'skip',
  );
  const deleteQ = useQuery(api.tasks.listMineByQuadrantPaginated, () =>
    $session
      ? {
          orgSlug: ORG,
          projectSlug: projectSlug(),
          userID: $session.userId,
          quadrant: 'delete',
          paginationOpts: { numItems: PER_QUADRANT, cursor: state.delete.cursor },
        }
      : 'skip',
  );

  function getQ(k: Quad) {
    return k === 'do' ? doQ : k === 'decide' ? decideQ : k === 'delegate' ? delegateQ : deleteQ;
  }

  function fuzzy(list: any[]) {
    const needle = q.trim();
    if (!needle) return list;
    const fuse = new Fuse(list, {
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

  function pseudoCount(k: Quad) {
    const q = getQ(k);
    const base = state[k].pageIndex * PER_QUADRANT;
    return q.data?.continueCursor ? base + PER_QUADRANT : base;
  }
  function canPrev(k: Quad) {
    return state[k].pageIndex > 1;
  }
  function canNext(k: Quad) {
    return !!getQ(k).data?.continueCursor;
  }
  function prev(k: Quad) {
    if (!canPrev(k)) return;
    state[k].pageIndex -= 1;
    state[k].cursor = state[k].stack[state[k].pageIndex - 1] ?? null;
  }
  function next(k: Quad) {
    const nextCursor = getQ(k).data?.continueCursor;
    if (!nextCursor) return;
    if (state[k].stack.length === state[k].pageIndex) state[k].stack.push(nextCursor);
    state[k].pageIndex += 1;
    state[k].cursor = nextCursor;
  }
</script>

<div class="space-y-4 p-6">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold">My tasks</h1>
      <p class="text-sm text-muted-foreground">Eisenhower matrix (project: {projectSlug()})</p>
    </div>

    <Input class="w-72" placeholder="Fuzzy search (within each quadrant page)..." bind:value={q} />
  </div>

  <div class="grid gap-4 lg:grid-cols-2">
    {#each quads as quad (quad.key)}
      {@const rq = getQ(quad.key)}
      <Card.Root class="min-h-72">
        <Card.Header>
          <Card.Title class="flex items-center justify-between">
            <span>{quad.title}</span>
            <Badge variant="secondary">{fuzzy(rq.data?.page ?? []).length}</Badge>
          </Card.Title>
          <Card.Description>{quad.subtitle}</Card.Description>
        </Card.Header>

        <Card.Content class="space-y-2">
          {#if rq.isLoading}
            <div class="text-sm text-muted-foreground">Loading…</div>
          {:else if rq.error}
            <div class="text-sm text-destructive">{rq.error.toString()}</div>
          {:else if (rq.data?.page?.length ?? 0) === 0}
            <div class="text-sm text-muted-foreground">No tasks here.</div>
          {:else}
            <div class="space-y-2">
              {#each fuzzy(rq.data?.page ?? []) as t (t._id)}
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <div class="cursor-default rounded-md border p-3 transition hover:bg-accent/40">
                      <div class="flex items-start justify-between gap-2">
                        <HoverCard.Root>
                          <HoverCard.Trigger>
                            <div class="line-clamp-2 leading-snug font-medium">{t.title}</div>
                          </HoverCard.Trigger>
                          <HoverCard.Content class="w-96">
                            <div class="space-y-2">
                              <div class="font-semibold">{t.title}</div>
                              <div class="text-sm wrap-break-word whitespace-pre-wrap text-muted-foreground">
                                {t.description || 'No description.'}
                              </div>
                              <div class="flex flex-wrap gap-2">
                                <Badge variant="secondary">{t.status}</Badge>
                                {#if t.isImportant}<Badge>Important</Badge>{/if}
                                {#if t.isUrgent}<Badge variant="destructive">Urgent</Badge>{/if}
                              </div>
                            </div>
                          </HoverCard.Content>
                        </HoverCard.Root>

                        <Badge variant="outline">{t.status}</Badge>
                      </div>
                    </div>
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

        <Card.Footer class="justify-between">
          <Button
            variant="outline"
            size="sm"
            onclick={() => {
              q = '';
              resetQuadrant(quad.key);
            }}
          >
            Reset
          </Button>

          <!-- shadcn-svelte pagination UI -->
          <Pagination.Root count={pseudoCount(quad.key)} perPage={PER_QUADRANT} page={state[quad.key].pageIndex}>
            {#snippet children()}
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    onclick={(e: MouseEvent) => {
                      e.preventDefault();
                      prev(quad.key);
                    }}
                    aria-disabled={!canPrev(quad.key)}
                    class={!canPrev(quad.key) ? 'pointer-events-none opacity-50' : ''}
                  />
                </Pagination.Item>

                <Pagination.Item>
                  <Pagination.Link
                    page={{
                      type: 'page',
                      value: state[quad.key].pageIndex,
                      key: `p-${quad.key}-${state[quad.key].pageIndex}`,
                    } as any}
                    isActive={true}
                  >
                    {state[quad.key].pageIndex}
                  </Pagination.Link>
                </Pagination.Item>

                <Pagination.Item>
                  <Pagination.Next
                    onclick={(e: MouseEvent) => {
                      e.preventDefault();
                      next(quad.key);
                    }}
                    aria-disabled={!canNext(quad.key)}
                    class={!canNext(quad.key) ? 'pointer-events-none opacity-50' : ''}
                  />
                </Pagination.Item>
              </Pagination.Content>
            {/snippet}
          </Pagination.Root>
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>
</div>
