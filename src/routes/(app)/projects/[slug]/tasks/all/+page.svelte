<script lang="ts">
  import { ChevronDown } from '@lucide/svelte';
  import { useConvexClient, useQuery } from 'convex-svelte';
  import { format, formatDistanceToNow } from 'date-fns';
  import Fuse from 'fuse.js';

  import { page } from '$app/state';

  import TaskHoverCard from '$lib/components/TaskHoverCard.svelte';
  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Pagination from '$lib/components/ui/pagination/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { api, type Id } from '$lib/convex/api';
  import { session } from '$lib/session';

  const client = useConvexClient();
  const projectSlug = () => page.params.slug as string;

  const PAGE_SIZE = 10;

  // server pagination cursor stack (enables Prev)
  let pageIndex = $state(1);
  let cursor = $state<string | null>(null);
  let cursorStack = $state<(string | null)[]>([null]);

  // filters
  let q = $state('');
  let status = $state<string>('all');
  let quadrant = $state<string>('all');
  let assigneeID = $state<string>('all');
  let reporterID = $state<string>('all');

  const statuses = [
    { value: 'all', label: 'All statuses' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'Todo' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'done', label: 'Done' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const quadrants = [
    { value: 'all', label: 'All' },
    { value: 'do', label: 'Do' },
    { value: 'decide', label: 'Decide' },
    { value: 'delegate', label: 'Delegate' },
    { value: 'delete', label: 'Delete' },
  ];

  const columns = [
    { key: 'backlog', label: 'Backlog' },
    { key: 'todo', label: 'Todo' },
    { key: 'in-progress', label: 'In progress' },
    { key: 'done', label: 'Done' },
    { key: 'canceled', label: 'Canceled' },
  ] as const;

  type ColKey = (typeof columns)[number]['key'];

  // sorting (current page only)
  type SortKey = 'assignee' | 'title' | 'status' | 'eisenhower' | 'dueDate' | 'reporter';
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

  // load members for filter dropdowns
  const membersQuery = useQuery(api.projects.membersBySlug, () => ({
    orgSlug: 'nanban',
    projectSlug: projectSlug(),
  }));

  // Check if user is a member of this project
  function isMember() {
    if (!$session) return false;
    const members = membersQuery.data?.members ?? [];
    return members.some((m) => m._id === $session.userId);
  }

  // reset paging when filters change
  $effect(() => {
    // read filter values to trigger effect on change
    void status;
    void quadrant;
    void assigneeID;
    void reporterID;
    cursor = null;
    pageIndex = 1;
    cursorStack = [null];
  });

  const data = useQuery(api.tasks.listForTablePaginated, () => ({
    orgSlug: 'nanban',
    projectSlug: projectSlug(),
    status: status === 'all' ? undefined : (status as any),
    quadrant: quadrant === 'all' ? 'all' : (quadrant as any),
    assigneeID: assigneeID === 'all' ? undefined : (assigneeID as Id<'users'>),
    reporterID: reporterID === 'all' ? undefined : (reporterID as Id<'users'>),
    paginationOpts: { numItems: PAGE_SIZE, cursor },
  }));

  // get total count for pagination display
  const countQuery = useQuery(api.tasks.countForProject, () => ({
    orgSlug: 'nanban',
    projectSlug: projectSlug(),
    status: status === 'all' ? undefined : (status as any),
    quadrant: quadrant === 'all' ? 'all' : (quadrant as any),
    assigneeID: assigneeID === 'all' ? undefined : (assigneeID as Id<'users'>),
    reporterID: reporterID === 'all' ? undefined : (reporterID as Id<'users'>),
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
      keys: ['title', 'description', 'assignee.name', 'reporter.name'],
      threshold: 0.35,
      ignoreLocation: true,
    });
    return fuse.search(needle).map((r) => r.item);
  }

  function sorted() {
    const list = filtered().slice();

    const dir = sortDir === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      let av: string | number;
      let bv: string | number;

      switch (sortKey) {
        case 'assignee':
          av = a.assignee?.name ?? '';
          bv = b.assignee?.name ?? '';
          break;
        case 'reporter':
          av = a.reporter?.name ?? '';
          bv = b.reporter?.name ?? '';
          break;
        case 'title':
          av = a.title;
          bv = b.title;
          break;
        case 'status':
          av = a.status;
          bv = b.status;
          break;
        case 'eisenhower':
          av = eisenhowerLabel(a);
          bv = eisenhowerLabel(b);
          break;
        case 'dueDate':
          av = a.completeBy ?? 0;
          bv = b.completeBy ?? 0;
          return (av - bv) * dir;
        default:
          av = a.status;
          bv = b.status;
      }

      return String(av).localeCompare(String(bv)) * dir;
    });

    return list;
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

    if (cursorStack.length === pageIndex) cursorStack.push(next);

    pageIndex += 1;
    cursor = next;
  }

  function goToPage(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages()) return;
    if (targetPage === pageIndex) return;

    // For cursor-based pagination, we can only reliably go to pages we've visited
    // or navigate sequentially. For simplicity, navigate sequentially.
    if (targetPage < pageIndex) {
      // Go back
      while (pageIndex > targetPage && canPrev()) {
        prevPage();
      }
    } else {
      // Go forward - but we need the cursors
      // If we have the cursor cached, use it
      if (cursorStack[targetPage - 1] !== undefined) {
        pageIndex = targetPage;
        cursor = cursorStack[targetPage - 1];
      }
    }
  }

  function resetAll() {
    q = '';
    status = 'all';
    quadrant = 'all';
    assigneeID = 'all';
    reporterID = 'all';
    sortKey = 'status';
    sortDir = 'asc';
    cursor = null;
    pageIndex = 1;
    cursorStack = [null];
  }

  async function setStatus(taskID: Id<'tasks'>, next: ColKey) {
    await client.mutation(api.tasks.update, { taskID, status: next });
  }

  async function toggleImportant(taskID: Id<'tasks'>, current: boolean) {
    await client.mutation(api.tasks.update, { taskID, isImportant: !current });
  }

  async function toggleUrgent(taskID: Id<'tasks'>, current: boolean) {
    await client.mutation(api.tasks.update, { taskID, isUrgent: !current });
  }

  function totalCount() {
    return countQuery.data?.count ?? 0;
  }

  function totalPages() {
    const count = totalCount();
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }
</script>

<svelte:head>
  <title>All Tasks - {page.params.slug} | Nanban</title>
</svelte:head>

<div class="space-y-4 p-6">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold">All tasks</h1>
      <p class="text-sm text-muted-foreground">
        {#if data.data?.project}{data.data.project.name}{:else}{projectSlug()}{/if}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Input class="w-64" placeholder="Search" bind:value={q} />

      <Select.Root type="single" bind:value={status}>
        <Select.Trigger class="w-40 justify-between">
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
        <Select.Trigger class="w-52 justify-between">
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

      <Select.Root type="single" bind:value={assigneeID}>
        <Select.Trigger class="w-44 justify-between">
          {#if assigneeID === 'all'}
            All assignees
          {:else}
            {membersQuery.data?.members.find((m) => m._id === assigneeID)?.name ?? 'Assignee'}
          {/if}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Assignee</Select.Label>
            <Select.Item value="all" label="All assignees">All assignees</Select.Item>
            {#each membersQuery.data?.members ?? [] as m (m._id)}
              <Select.Item value={m._id} label={m.name}>{m.name}</Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <Select.Root type="single" bind:value={reporterID}>
        <Select.Trigger class="w-44 justify-between">
          {#if reporterID === 'all'}
            All reporters
          {:else}
            {membersQuery.data?.members.find((m) => m._id === reporterID)?.name ?? 'Reporter'}
          {/if}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Reporter</Select.Label>
            <Select.Item value="all" label="All reporters">All reporters</Select.Item>
            {#each membersQuery.data?.members ?? [] as m (m._id)}
              <Select.Item value={m._id} label={m.name}>{m.name}</Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <Button variant="outline" onclick={resetAll}>Reset</Button>
    </div>
  </div>

  {#if data.isLoading}
    <div class="overflow-hidden rounded-lg border bg-card">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-48">Assignee</Table.Head>
            <Table.Head>Title</Table.Head>
            <Table.Head class="w-36">Status</Table.Head>
            <Table.Head class="w-36">Eisenhower</Table.Head>
            <Table.Head class="w-48">Reporter</Table.Head>
            <Table.Head class="w-36">Due</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each Array(20) as _}
            <Table.Row>
              <Table.Cell><Skeleton class="h-6 w-32" /></Table.Cell>
              <Table.Cell><Skeleton class="h-6 w-64" /></Table.Cell>
              <Table.Cell><Skeleton class="h-6 w-20" /></Table.Cell>
              <Table.Cell><Skeleton class="h-6 w-20" /></Table.Cell>
              <Table.Cell><Skeleton class="h-6 w-32" /></Table.Cell>
              <Table.Cell><Skeleton class="h-6 w-24" /></Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {:else if data.error}
    <div class="text-sm text-destructive">{data.error.toString()}</div>
  {:else if !data.data?.project}
    <div class="text-sm text-muted-foreground">Project not found.</div>
  {:else}
    <div class="overflow-hidden rounded-lg border bg-card">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-48">
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('assignee')}>
                Assignee {sortKey === 'assignee' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            </Table.Head>

            <Table.Head>
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('title')}>
                Title {sortKey === 'title' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            </Table.Head>

            <Table.Head class="w-36">
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('status')}>
                Status {sortKey === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            </Table.Head>

            <Table.Head class="w-36">
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('eisenhower')}>
                Eisenhower {sortKey === 'eisenhower' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            </Table.Head>

            <Table.Head class="w-48">
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('reporter')}>
                Reporter {sortKey === 'reporter' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            </Table.Head>

            <Table.Head class="w-36">
              <button type="button" class="font-medium hover:underline" onclick={() => toggleSort('dueDate')}>
                Due {sortKey === 'dueDate' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {#if sorted().length === 0}
            <Table.Row>
              <Table.Cell colspan={6} class="py-10 text-center text-sm text-muted-foreground">
                No tasks match.
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each sorted() as t (t._id)}
              <Table.Row class="cursor-default hover:bg-accent/40">
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
                  <TaskHoverCard
                    title={t.title}
                    description={t.description}
                    status={t.status}
                    isImportant={t.isImportant}
                    isUrgent={t.isUrgent}
                  >
                    <span class="cursor-default">{t.title}</span>
                  </TaskHoverCard>
                </Table.Cell>

                <Table.Cell>
                  {#if isMember()}
                    <Select.Root
                      type="single"
                      value={t.status}
                      onValueChange={(v) => v && setStatus(t._id, v as ColKey)}
                    >
                      <Select.Trigger class="h-7 w-28 text-xs">{t.status}</Select.Trigger>
                      <Select.Content>
                        {#each columns as s (s.key)}
                          <Select.Item value={s.key} label={s.label}>{s.label}</Select.Item>
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  {:else}
                    <Badge variant="outline" class="text-xs">{t.status}</Badge>
                  {/if}
                </Table.Cell>

                <Table.Cell>
                  <div class="flex items-center gap-1">
                    {#if isMember()}
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <Badge variant="outline" class="text-xs">{eisenhowerLabel(t)} <ChevronDown /></Badge>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          <DropdownMenu.Item onclick={() => toggleImportant(t._id, t.isImportant)}>
                            {t.isImportant ? 'Unmark important' : 'Mark important'}
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onclick={() => toggleUrgent(t._id, t.isUrgent)}>
                            {t.isUrgent ? 'Unmark urgent' : 'Mark urgent'}
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    {:else}
                      <Badge variant="outline" class="text-xs">{eisenhowerLabel(t)}</Badge>
                    {/if}
                  </div>
                </Table.Cell>

                <Table.Cell>
                  {#if t.reporter}
                    <div class="flex items-center gap-2">
                      <Avatar.Root class="size-6">
                        {#if t.reporter.avatarURL}
                          <Avatar.Image src={t.reporter.avatarURL} alt={t.reporter.name} />
                        {/if}
                        <Avatar.Fallback>{t.reporter.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                      </Avatar.Root>
                      <span class="truncate text-sm">{t.reporter.name}</span>
                    </div>
                  {:else}
                    <span class="text-muted-foreground">-</span>
                  {/if}
                </Table.Cell>

                <Table.Cell>
                  {#if t.completeBy}
                    <span class="text-sm" title={format(t.completeBy, 'PPP')}>
                      {formatDistanceToNow(t.completeBy, { addSuffix: true })}
                    </span>
                  {:else}
                    <span class="text-muted-foreground">-</span>
                  {/if}
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between gap-3">
      <div class="text-sm text-muted-foreground">{totalCount()} total tasks</div>

      <Pagination.Root count={totalCount()} perPage={PAGE_SIZE} page={pageIndex}>
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

            {#each Array.from({ length: totalPages() }, (_, i) => i + 1) as p}
              {#if p === 1 || p === totalPages() || (p >= pageIndex - 1 && p <= pageIndex + 1)}
                <Pagination.Item>
                  <Pagination.Link
                    page={{ type: 'page', value: p, key: `p-${p}` } as any}
                    isActive={p === pageIndex}
                    onclick={(e: MouseEvent) => {
                      e.preventDefault();
                      goToPage(p);
                    }}
                  >
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              {:else if p === 2 && pageIndex > 3}
                <Pagination.Item>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              {:else if p === totalPages() - 1 && pageIndex < totalPages() - 2}
                <Pagination.Item>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              {/if}
            {/each}

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
