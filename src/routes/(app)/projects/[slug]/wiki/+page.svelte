<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { api } from '$lib/convex/api';

  const client = useConvexClient();
  const projectSlug = () => page.params.slug as string;

  const data = useQuery(api.wiki.listByProject, () => ({
    orgSlug: 'nanban',
    projectSlug: projectSlug(),
  }));

  let newTitle = $state('');
  let creating = $state(false);
  let err = $state<string | null>(null);

  async function createPage() {
    err = null;
    const title = newTitle.trim();
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
      });
      newTitle = '';
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
    <Card.Content class="flex flex-wrap gap-2">
      <Input class="w-72" placeholder="Page title…" bind:value={newTitle} />
      <Button disabled={creating} onclick={createPage}>
        {#if creating}Creating…{:else}Create{/if}
      </Button>
      {#if err}<div class="w-full text-sm text-destructive">{err}</div>{/if}
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>All pages</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-2">
      {#if data.isLoading}
        <div class="text-sm text-muted-foreground">Loading…</div>
      {:else if data.error}
        <div class="text-sm text-destructive">{data.error.toString()}</div>
      {:else if (data.data?.pages?.length ?? 0) === 0}
        <div class="text-sm text-muted-foreground">No wiki pages yet.</div>
      {:else}
        <div class="space-y-1">
          {#each data.data.pages as w (w._id)}
            <button
              type="button"
              class="w-full rounded-md border px-3 py-2 text-left hover:bg-accent/40"
              onclick={() => goto(`/projects/${projectSlug()}/wiki/${w._id}`)}
            >
              <div class="font-medium">{w.title}</div>
              <div class="text-xs text-muted-foreground">
                Last edited: {new Date(w.lastEdited).toLocaleString()}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
