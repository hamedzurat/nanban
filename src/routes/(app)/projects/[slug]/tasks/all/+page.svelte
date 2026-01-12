<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import Fuse from 'fuse.js';

  import { page } from '$app/state';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as HoverCard from '$lib/components/ui/hover-card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Pagination from '$lib/components/ui/pagination/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { api, type Id } from '$lib/convex/api';

  const client = useConvexClient();
  const projectSlug = () => page.params.slug as string;

  const PAGE_SIZE = 10;

  // server pagination cursor stack (enables Prev)
  let pageIndex = $state(1);
  let cursor = $state<string | null>(null);
  let cursorStack = $state<(string | null)[]>([null]); // cursor for page 1 is null

  // filters
  let q = $state('');
  let status = $state<string>('all');
  let quadrant = $state<string>('all');

  const statuses = [
    { value: 'all', label: 'All statuses' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'Todo' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'done', label: 'Done' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const quadrants = [
    { value: 'all', label: 'All quadrants' },
    { value: 'do', label: 'Do (Important + Urgent)' },
    { value: 'decide', label: 'Decide (Important, not urgent)' },
    { value: 'delegate', label: 'Delegate (Urgent, not important)' },
    { value: 'delete', label: 'Delete (Neither)' },
  ];

  // sorting (current page only)
  type SortKey = 'assignee' | 'title' | 'status' | 'eisenhower';
  let sortKey = $state<SortKey>('status');
  let sortDir = $state<'asc' | 'desc'>('asc');

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = k;
      sortDir = 'asc';
    }
  }

  // reset paging when filters change
  $effect(() => {
    // whenever status/quadrant changes, reset paging
    // (q does not change server paging; it's local)
    cursor = null;
    pageIndex = 1;
    cursorStack = [null];
  });

  const data = useQuery(api.tasks.listForTablePaginated, () => ({
    orgSlug: 'zurat',
    projectSlug: projectSlug(),
    status: status === 'all' ? undefined : (status as any),
    quadrant: quadrant === 'all' ? 'all' : (quadrant as any),
    paginationOpts: { numItems: PAGE_SIZE, cursor },
  }));

  function eisenhowerLabel(t: any) {
    if (t.isImportant && t.isUrgent) return 'Do';
    if (t.isImportant && !t.isUrgent) return 'Decide';
    if (!t.isImportant && t.isUrgent) return 'Delegate';
    return 'Delete';
  }

  // fuzzy search (current page)
  function filtered() {
    const list = data.data?.page ?? [];
    const needle = q.trim();
    if (!needle) return list;

    const fuse = new Fuse(list, {
      keys: ['title', 'description', 'assignee.name'],
      threshold: 0.35,
      ignoreLocation: true,
    });
    return fuse.search(needle).map((r) => r.item);
  }

  function sorted() {
    const list = filtered().slice();

    const dir = sortDir === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      const av =
        sortKey === 'assignee'
          ? (a.assignee?.name ?? '')
          : sortKey === 'title'
            ? a.title
            : sortKey === 'status'
              ? a.status
              : eisenhowerLabel(a);

      const bv =
        sortKey === 'assignee'
          ? (b.assignee?.name ?? '')
          : sortKey === 'title'
            ? b.title
            : sortKey === 'status'
              ? b.status
              : eisenhowerLabel(b);

      return av.localeCompare(bv) * dir;
    });

    return list;
  }

  // pagination controls
  function pseudoCount() {
    // Pagination.Root wants a count. We don’t know total (cursor-based),
    // so we give it “at least one more page” when continueCursor exists.
    // This drives Previous/Next state + basic UI.
    const base = pageIndex * PAGE_SIZE;
    return data.data?.continueCursor ? base + PAGE_SIZE : base;
  }

  function canPrev() {
    return pageIndex > 1;
  }
  function canNext() {
    return !!data.data?.continueCursor;
  }

  function prevPage() {
    if (!canPrev()) return;
    pageIndex -= 1;
    cursor = cursorStack[pageIndex - 1] ?? null;
  }

  function nextPage() {
    const next = data.data?.continueCursor;
    if (!next) return;

    // store cursor for next page
    if (cursorStack.length === pageIndex) cursorStack.push(next);

    pageIndex += 1;
    cursor = next;
  }

  function resetAll() {
    q = '';
    status = 'all';
    quadrant = 'all';
    sortKey = 'status';
    sortDir = 'asc';
    cursor = null;
    pageIndex = 1;
    cursorStack = [null];
  }

  async function setStatus(taskID: Id<'tasks'>, next: any) {
    await client.mutation(api.tasks.update, { taskID, status: next });
  }
</script>

<div class="space-y-4 p-6">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold">All tasks</h1>
      <p class="text-sm text-muted-foreground">
        {#if data.data?.project}{data.data.project.name}{:else}{projectSlug()}{/if}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Input class="w-64" placeholder="Fuzzy search (current page)..." bind:value={q} />

      <Select.Root type="single" bind:value={status}>
        <Select.Trigger class="w-44 justify-between">
          {statuses.find((s) => s.value === status)?.label ?? 'Status'}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Status</Select.Label>
            {#each statuses as s (s.value)}
              <Select.Item value={s.value} label={s.label}>{s.label}</Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <Select.Root type="single" bind:value={quadrant}>
        <Select.Trigger class="w-56 justify-between">
          {quadrants.find((p) => p.value === quadrant)?.label ?? 'Eisenhower'}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Eisenhower</Select.Label>
            {#each quadrants as p (p.value)}
              <Select.Item value={p.value} label={p.label}>{p.label}</Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <Button variant="outline" onclick={resetAll}>Reset</Button>
    </div>
  </div>

  {#if data.isLoading}
    <div class="text-sm text-muted-foreground">Loading…</div>
  {:else if data.error}
    <div class="text-sm text-destructive">{data.error.toString()}</div>
  {:else if !data.data?.project}
    <div class="text-sm text-muted-foreground">Project not found.</div>
  {:else}
    <div class="overflow-hidden rounded-lg border bg-card">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-56">
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('assignee')}>
                Delegate to
              </button>
            </Table.Head>

            <Table.Head>
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('title')}>
                Title
              </button>
            </Table.Head>

            <Table.Head class="w-40">
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('status')}>
                Status
              </button>
            </Table.Head>

            <Table.Head class="w-40">
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('eisenhower')}>
                Eisenhower
              </button>
            </Table.Head>

            <Table.Head class="w-28 text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>

        <!-- IMPORTANT: Table.Body contains ONLY Table.Row children (no wrappers) -->
        <Table.Body>
          {#if sorted().length === 0}
            <Table.Row>
              <Table.Cell colspan={5} class="py-10 text-center text-sm text-muted-foreground">
                No tasks match.
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each sorted() as t (t._id)}
              <Table.Row class="hover:bg-accent/40">
                <Table.Cell>
                  {#if t.assignee}
                    <div class="flex items-center gap-2">
                      <Avatar.Root class="size-7">
                        {#if t.assignee.avatarURL}
                          <Avatar.Image src={t.assignee.avatarURL} alt={t.assignee.name} />
                        {/if}
                        <Avatar.Fallback>{t.assignee.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                      </Avatar.Root>
                      <span class="truncate">{t.assignee.name}</span>
                    </div>
                  {:else}
                    <span class="text-muted-foreground">Unassigned</span>
                  {/if}
                </Table.Cell>

                <Table.Cell class="font-medium">
                  <HoverCard.Root>
                    <HoverCard.Trigger asChild>
                      <span class="cursor-default">{t.title}</span>
                    </HoverCard.Trigger>
                    <HoverCard.Content class="w-96">
                      <div class="space-y-2">
                        <div class="font-semibold">{t.title}</div>
                        <div class="text-sm wrap-break-word whitespace-pre-wrap text-muted-foreground">
                          {t.description || 'No description.'}
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <Badge variant="secondary">{t.status}</Badge>
                          <Badge variant="outline">{eisenhowerLabel(t)}</Badge>
                          {#if t.isImportant}<Badge>Important</Badge>{/if}
                          {#if t.isUrgent}<Badge variant="destructive">Urgent</Badge>{/if}
                        </div>
                      </div>
                    </HoverCard.Content>
                  </HoverCard.Root>
                </Table.Cell>

                <Table.Cell>
                  <Badge variant="secondary">{t.status}</Badge>
                </Table.Cell>

                <Table.Cell>
                  <Badge variant="outline">{eisenhowerLabel(t)}</Badge>
                </Table.Cell>

                <Table.Cell class="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onclick={() => setStatus(t._id, t.status === 'done' ? 'todo' : 'done')}
                    title="Quick toggle done"
                  >
                    {t.status === 'done' ? 'Undo' : 'Done'}
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </div>

    <!-- shadcn-svelte Pagination UI (Prev/Next + page) -->
    <div class="flex items-center justify-between gap-3">
      <div class="text-sm text-muted-foreground">
        Page {pageIndex} · showing {sorted().length} (max {PAGE_SIZE})
      </div>

      <Pagination.Root count={pseudoCount()} perPage={PAGE_SIZE} page={pageIndex}>
        {#snippet children()}
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                onclick={(e: MouseEvent) => {
                  e.preventDefault();
                  prevPage();
                }}
                aria-disabled={!canPrev()}
                class={!canPrev() ? 'pointer-events-none opacity-50' : ''}
              />
            </Pagination.Item>

            <Pagination.Item>
              <Pagination.Link page={{ type: 'page', value: pageIndex, key: `p-${pageIndex}` } as any} isActive={true}>
                {pageIndex}
              </Pagination.Link>
            </Pagination.Item>

            <Pagination.Item>
              <Pagination.Next
                onclick={(e: MouseEvent) => {
                  e.preventDefault();
                  nextPage();
                }}
                aria-disabled={!canNext()}
                class={!canNext() ? 'pointer-events-none opacity-50' : ''}
              />
            </Pagination.Item>
          </Pagination.Content>
        {/snippet}
      </Pagination.Root>
    </div>
  {/if}
</div>
