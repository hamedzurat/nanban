<script lang="ts">
  import { useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import { api } from '$lib/convex/api';

  const dashboard = useQuery(api.dashboard.company, () => ({ orgSlug: 'nanban' }));

  function openProject(slug: string) {
    goto(`/projects/${slug}/kanban`);
  }
</script>

<div class="space-y-6 p-6">
  <div>
    <h1 class="text-2xl font-semibold">Company dashboard</h1>
    <p class="text-sm text-muted-foreground">
      {#if dashboard.data?.org}{dashboard.data.org.name}{:else}No org found{/if}
    </p>
  </div>

  {#if dashboard.isLoading}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each Array(3) as _}
        <Card.Root>
          <Card.Header class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1 space-y-1">
                <Skeleton class="h-5 w-1/3" />
                <Skeleton class="h-4 w-full" />
              </div>
              <Skeleton class="h-5 w-10 rounded-full" />
            </div>

            <Skeleton class="h-2 w-full" />
          </Card.Header>

          <Card.Content class="space-y-3">
            <div class="grid grid-cols-2 gap-2 text-sm">
              {#each Array(5) as _}
                <div class="flex items-center justify-between">
                  <Skeleton class="h-4 w-16" />
                  <Skeleton class="h-4 w-4" />
                </div>
              {/each}
            </div>

            <div class="flex items-center gap-1">
              {#each Array(4) as _}
                <Skeleton class="size-7 rounded-full" />
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {:else if dashboard.error}
    <div class="text-sm text-destructive">
      Failed to load: {dashboard.error.toString()}
    </div>
  {:else if !dashboard.data || dashboard.data.projects.length === 0}
    <Card.Root>
      <Card.Header>
        <Card.Title>No projects yet</Card.Title>
        <Card.Description>Seed data or create a project in Convex to see progress here.</Card.Description>
      </Card.Header>
    </Card.Root>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each dashboard.data.projects as p}
        <Card.Root class="cursor-pointer transition-shadow hover:shadow-sm" onclick={() => openProject(p.slug)}>
          <Card.Header class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <Card.Title class="truncate">{p.name}</Card.Title>
                <Card.Description class="line-clamp-2">{p.description}</Card.Description>
              </div>
              <Badge variant="secondary">{p.completion}%</Badge>
            </div>

            <Progress value={p.completion} />
          </Card.Header>

          <Card.Content class="space-y-3">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Backlog</span><span>{p.counts.backlog}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Todo</span><span>{p.counts.todo}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">In progress</span><span>{p.counts['in-progress']}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Done</span><span>{p.counts.done}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Canceled</span><span>{p.counts.canceled}</span>
              </div>
            </div>

            <div class="flex items-center gap-1">
              {#each p.members.slice(0, 6) as m}
                <Avatar.Root class="size-7">
                  {#if m.avatarURL}
                    <Avatar.Image src={m.avatarURL} alt={m.name} />
                  {/if}
                  <Avatar.Fallback>{m.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar.Root>
              {/each}
              {#if p.members.length > 6}
                <div class="pl-2 text-xs text-muted-foreground">+{p.members.length - 6}</div>
              {/if}
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
