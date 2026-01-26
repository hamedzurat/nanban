<script lang="ts">
  import { FileText } from '@lucide/svelte';
  import { useConvexClient, useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import { api } from '$lib/convex/api';

  const client = useConvexClient();
  const projectSlug = () => page.params.slug as string;

  const data = useQuery(api.wiki.listByProject, () => ({
    orgSlug: 'nanban',
    projectSlug: projectSlug(),
  }));

  let newTitle = $state('');
  let newThumbnail = $state('');
  let creating = $state(false);
  let err = $state<string | null>(null);

  async function createPage() {
    err = null;
    const title = newTitle.trim();
    const thumbnail = newThumbnail.trim() || undefined;
    if (!title) {
      err = 'Title is required';
      return;
    }
    creating = true;
    try {
      const res = await client.mutation(api.wiki.create, {
        orgSlug: 'nanban',
        projectSlug: projectSlug(),
        title,
        content: '',
        thumbnail,
      });
      newTitle = '';
      newThumbnail = '';
      await goto(`/projects/${projectSlug()}/wiki/${res.id}`);
    } catch (e) {
      err = e instanceof Error ? e.message : 'Failed to create page';
    } finally {
      creating = false;
    }
  }
</script>

<div class="space-y-4 p-6">
  <div>
    <h1 class="text-2xl font-semibold">Wiki</h1>
    <p class="text-sm text-muted-foreground">Pages for this project (latest edited first)</p>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Create page</Card.Title>
      <Card.Description>Start a new wiki page with a unique title.</Card.Description>
    </Card.Header>
    <Card.Content class="grid gap-4 sm:flex sm:items-end">
      <div class="grid w-full gap-2">
        <Input class="w-full" placeholder="Page title…" bind:value={newTitle} />
        <Input class="w-full" placeholder="Thumbnail URL (optional)..." bind:value={newThumbnail} />
        <Button class="min-w-24" disabled={creating} onclick={createPage}>
          {#if creating}Creating…{:else}Create{/if}
        </Button>
      </div>
    </Card.Content>
    {#if err}
      <Card.Footer>
        <div class="text-sm text-destructive">{err}</div>
      </Card.Footer>
    {/if}
  </Card.Root>

  <div class="mt-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold tracking-tight">All Pages</h2>
    </div>

    {#if data.isLoading}
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {#each { length: 5 } as _}
          <div class="aspect-square rounded-xl border bg-card text-card-foreground shadow-sm">
            <div class="flex h-full flex-col justify-between p-6">
              <div class="space-y-2">
                <Skeleton class="h-6 w-3/4" />
                <Skeleton class="h-4 w-1/2" />
              </div>
              <Skeleton class="h-4 w-1/3" />
            </div>
          </div>
        {/each}
      </div>
    {:else if data.error}
      <div class="text-sm text-destructive">{data.error.toString()}</div>
    {:else if (data.data?.pages?.length ?? 0) === 0}
      <div class="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No wiki pages yet. Create one above!
      </div>
    {:else}
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {#each data.data!.pages as w (w._id)}
          <button
            class="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
            onclick={() => goto(`/projects/${projectSlug()}/wiki/${w._id}`)}
          >
            {#if w.thumbnail}
              <img
                src={w.thumbnail}
                alt={w.title}
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
            {:else}
              <div class="absolute -top-4 -right-4 opacity-5 transition-opacity group-hover:opacity-10">
                <FileText class="h-32 w-32" />
              </div>
            {/if}

            <div class="relative z-10 flex h-full flex-col justify-end p-6 text-left">
              <h3
                class="line-clamp-3 text-lg leading-tight font-semibold tracking-tight {w.thumbnail
                  ? 'text-white'
                  : 'group-hover:text-primary'}"
              >
                {w.title}
              </h3>
            </div>

            <div class="relative z-10 border-t p-4 {w.thumbnail ? 'border-white/20' : 'bg-card/50'} backdrop-blur-sm">
              <p class="text-xs font-medium {w.thumbnail ? 'text-white/80' : 'text-muted-foreground'}">
                {new Date(w.lastEdited).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
