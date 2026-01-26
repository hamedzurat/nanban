<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import { formatDistanceToNow } from 'date-fns';
  import DOMPurify from 'isomorphic-dompurify';
  import { marked } from 'marked';

  import { page } from '$app/state';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
  import * as HoverCard from '$lib/components/ui/hover-card/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import { api, type Id } from '$lib/convex/api';

  const client = useConvexClient();

  const projectSlug = () => page.params.slug as string;

  const kanban = useQuery(api.tasks.listForKanban, () => ({
    orgSlug: 'nanban',
    projectSlug: projectSlug(),
  }));

  const columns = [
    { key: 'backlog', label: 'Backlog' },
    { key: 'todo', label: 'Todo' },
    { key: 'in-progress', label: 'In progress' },
    { key: 'done', label: 'Done' },
    { key: 'canceled', label: 'Canceled' },
  ] as const;

  type ColKey = (typeof columns)[number]['key'];

  function tasksByStatus(status: ColKey) {
    const list = kanban.data?.tasks ?? [];
    return list.filter((t) => t.status === status);
  }

  function priorityLabel(t: { isImportant: boolean; isUrgent: boolean }) {
    if (t.isImportant && t.isUrgent) return 'Important & Urgent';
    if (t.isImportant) return 'Important';
    if (t.isUrgent) return 'Urgent';
    return 'Normal';
  }

  async function setStatus(taskID: Id<'tasks'>, status: ColKey) {
    await client.mutation(api.tasks.update, { taskID, status });
  }

  async function toggleImportant(taskID: Id<'tasks'>, current: boolean) {
    await client.mutation(api.tasks.update, { taskID, isImportant: !current });
  }

  async function toggleUrgent(taskID: Id<'tasks'>, current: boolean) {
    await client.mutation(api.tasks.update, { taskID, isUrgent: !current });
  }

  function renderDescription(text: string) {
    const html = marked.parse(text) as string;
    return DOMPurify.sanitize(html);
  }
</script>

<div class="space-y-4 p-6">
  <div>
    <h1 class="text-2xl font-semibold">Kanban</h1>
    <p class="text-sm text-muted-foreground">
      {#if kanban.data?.project}
        {kanban.data.project.name}
      {:else}
        {projectSlug()}
      {/if}
    </p>
  </div>

  {#if kanban.isLoading}
    <div class="grid gap-4 lg:grid-cols-5">
      {#each columns as col}
        <div class="flex h-[60dvh] flex-col rounded-lg border bg-card">
          <div class="flex items-center justify-between p-3">
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-5 w-8 rounded-full" />
          </div>
          <div class="space-y-3 p-3 pt-0">
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-24 w-full" />
          </div>
        </div>
      {/each}
    </div>
  {:else if kanban.error}
    <div class="text-sm text-destructive">{kanban.error.toString()}</div>
  {:else if !kanban.data?.project}
    <Card.Root>
      <Card.Header>
        <Card.Title>Project not found</Card.Title>
        <Card.Description>
          No project for slug “{projectSlug()}” in org “nanban”.
        </Card.Description>
      </Card.Header>
    </Card.Root>
  {:else}
    <div class="grid gap-4 lg:grid-cols-5">
      {#each columns as col (col.key)}
        <div class="flex min-h-[60dvh] flex-col rounded-lg border bg-card">
          <div class="flex items-center justify-between p-3">
            <div class="font-semibold">{col.label}</div>
            <Badge variant="secondary">{tasksByStatus(col.key).length}</Badge>
          </div>

          <ScrollArea class="flex-1">
            <div class="space-y-2 p-3">
              {#if tasksByStatus(col.key).length === 0}
                <div class="text-xs text-muted-foreground">No tasks.</div>
              {:else}
                {#each tasksByStatus(col.key) as t (t._id)}
                  <ContextMenu.Root>
                    <ContextMenu.Trigger>
                      <HoverCard.Root>
                        <HoverCard.Trigger>
                          <div
                            class="cursor-default rounded-md border bg-background p-3 transition hover:bg-accent hover:text-accent-foreground"
                          >
                            <div class="flex items-start justify-between gap-2">
                              <div class="line-clamp-2 leading-snug font-medium">{t.title}</div>
                              <Badge variant="outline" class="shrink-0">{priorityLabel(t)}</Badge>
                            </div>

                            <div class="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <div class="flex items-center gap-2">
                                {#if t.assignee}
                                  <Avatar.Root class="size-6">
                                    {#if t.assignee.avatarURL}
                                      <Avatar.Image src={t.assignee.avatarURL} alt={t.assignee.name} />
                                    {/if}
                                    <Avatar.Fallback>{t.assignee.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                                  </Avatar.Root>
                                  <span class="truncate">{t.assignee.name}</span>
                                {:else}
                                  <span>Unassigned</span>
                                {/if}
                              </div>
                              {#if t.completeBy}
                                <span class="whitespace-nowrap"
                                  >{formatDistanceToNow(t.completeBy, { addSuffix: true })}</span
                                >
                              {/if}
                            </div>
                          </div>
                        </HoverCard.Trigger>

                        <HoverCard.Content class="w-96">
                          <div class="space-y-3">
                            <div class="font-semibold">{t.title}</div>
                            <div
                              class="prose prose-sm max-h-[300px] overflow-y-auto rounded-md bg-muted/50 p-3 text-sm text-foreground prose-invert dark:prose-invert prose-headings:mt-2 prose-headings:text-base prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                            >
                              {#if t.description}
                                {@html renderDescription(t.description)}
                              {:else}
                                <span class="text-muted-foreground">No description.</span>
                              {/if}
                            </div>

                            <div class="flex gap-2">
                              {#if t.isImportant}<Badge>Important</Badge>{/if}
                              {#if t.isUrgent}<Badge variant="destructive">Urgent</Badge>{/if}
                              <Badge variant="secondary">{t.status}</Badge>
                            </div>
                          </div>
                        </HoverCard.Content>
                      </HoverCard.Root>
                    </ContextMenu.Trigger>

                    <ContextMenu.Content>
                      <ContextMenu.Label>Actions</ContextMenu.Label>
                      <ContextMenu.Separator />

                      <ContextMenu.Sub>
                        <ContextMenu.SubTrigger>Move to</ContextMenu.SubTrigger>
                        <ContextMenu.SubContent>
                          {#each columns as s (s.key)}
                            <ContextMenu.Item onclick={() => setStatus(t._id, s.key)}>
                              {s.label}
                            </ContextMenu.Item>
                          {/each}
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
              {/if}
            </div>
          </ScrollArea>
        </div>
      {/each}
    </div>
  {/if}
</div>
