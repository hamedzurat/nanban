<script lang="ts">
  import { useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as HoverCard from '$lib/components/ui/hover-card/index.js';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import { api } from '$lib/convex/api';

  const dashboard = useQuery(api.dashboard.company, () => ({ orgSlug: 'nanban' }));

  function openProject(slug: string) {
    goto(`/projects/${slug}/kanban`);
  }
</script>

<div class="mx-auto max-w-6xl space-y-8 p-8">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Company Dashboard</h1>
    <p class="mt-1 text-muted-foreground">
      {#if dashboard.data?.org}{dashboard.data.org.name}{:else}No org found{/if}
    </p>
  </div>

  {#if dashboard.isLoading}
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each Array(6) as _}
        <Card.Root class="p-6">
          <Card.Header class="space-y-3 p-0 pb-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1 space-y-2">
                <Skeleton class="h-6 w-1/2" />
                <Skeleton class="h-4 w-full" />
              </div>
              <Skeleton class="h-6 w-14 rounded-full" />
            </div>
            <Skeleton class="h-3 w-full rounded-full" />
          </Card.Header>

          <Card.Content class="space-y-4 p-0">
            <div class="grid grid-cols-2 gap-3">
              {#each Array(5) as _}
                <div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <Skeleton class="h-4 w-16" />
                  <Skeleton class="h-4 w-6" />
                </div>
              {/each}
            </div>

            <div class="flex items-center gap-2 pt-2">
              {#each Array(4) as _}
                <Skeleton class="size-9 rounded-full" />
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {:else if dashboard.error}
    <div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
      Failed to load: {dashboard.error.toString()}
    </div>
  {:else if !dashboard.data || dashboard.data.projects.length === 0}
    <Card.Root class="p-8 text-center">
      <Card.Header>
        <Card.Title class="text-xl">No projects yet</Card.Title>
        <Card.Description class="mt-2">Seed data or create a project in Convex to see progress here.</Card.Description>
      </Card.Header>
    </Card.Root>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {#each dashboard.data.projects as p}
        <Card.Root class="cursor-pointer p-6" onclick={() => openProject(p.slug)}>
          <Card.Header class="space-y-3 p-0 pb-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <Card.Title class="truncate text-lg">{p.name}</Card.Title>
                <Card.Description class="mt-1 line-clamp-2">{p.description}</Card.Description>
              </div>
              <Badge variant="secondary" class="text-sm font-semibold">{p.completion}%</Badge>
            </div>

            <Progress value={p.completion} class="h-2" />
          </Card.Header>

          <Card.Content class="space-y-4 p-0">
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span class="text-muted-foreground">Backlog</span>
                <span class="font-medium">{p.counts.backlog}</span>
              </div>
              <div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span class="text-muted-foreground">Canceled</span>
                <span class="font-medium">{p.counts.canceled}</span>
              </div>
              <div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span class="text-muted-foreground">In progress</span>
                <span class="font-medium">{p.counts['in-progress']}</span>
              </div>
              <div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span class="text-muted-foreground">Done</span>
                <span class="font-medium">{p.counts.done}</span>
              </div>
              <div class="col-span-2 flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span class="text-muted-foreground">Todo</span>
                <span class="font-medium">{p.counts.todo}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-2">
              {#each p.members.slice(0, 6) as m}
                <HoverCard.Root>
                  <HoverCard.Trigger
                    class="rounded-full ring-2 ring-background transition-transform hover:scale-110 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <Avatar.Root class="size-9">
                      {#if m.avatarURL}
                        <Avatar.Image src={m.avatarURL} alt={m.name} />
                      {/if}
                      <Avatar.Fallback class="text-xs">{m.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                    </Avatar.Root>
                  </HoverCard.Trigger>
                  <HoverCard.Content class="w-56">
                    <div class="flex gap-4">
                      <Avatar.Root class="size-10">
                        {#if m.avatarURL}
                          <Avatar.Image src={m.avatarURL} alt={m.name} />
                        {/if}
                        <Avatar.Fallback>{m.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                      </Avatar.Root>
                      <div class="space-y-1">
                        <h4 class="text-sm font-semibold">{m.name}</h4>
                        <p class="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </HoverCard.Content>
                </HoverCard.Root>
              {/each}
              {#if p.members.length > 6}
                <div
                  class="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
                >
                  +{p.members.length - 6}
                </div>
              {/if}
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
