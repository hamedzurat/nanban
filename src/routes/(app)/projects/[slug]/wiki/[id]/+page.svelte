<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import DOMPurify from 'isomorphic-dompurify';
  import { marked } from 'marked';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Menubar from '$lib/components/ui/menubar/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import { api, type Id } from '$lib/convex/api';

  const client = useConvexClient();

  const wikiId = () => page.params.id as Id<'wiki'>;
  const projectSlug = () => page.params.slug as string;

  const w = useQuery(api.wiki.get, () => ({ id: wikiId() }));

  let editing = $state(false);
  let draft = $state('');
  let editTitle = $state('');
  let editThumbnail = $state('');
  let saving = $state(false);

  $effect(() => {
    if (w.data && !editing) {
      draft = w.data.content ?? '';
      editTitle = w.data.title;
      editThumbnail = w.data.thumbnail ?? '';
    }
  });

  function safeHtml(md: string) {
    const html = marked.parse(md);
    return DOMPurify.sanitize(html as string);
  }

  async function startEdit() {
    if (!w.data) return;
    draft = w.data.content ?? '';
    editTitle = w.data.title;
    editThumbnail = w.data.thumbnail ?? '';
    editing = true;
  }

  async function save() {
    if (!w.data) return;
    saving = true;
    try {
      await client.mutation(api.wiki.update, {
        id: w.data._id,
        content: draft,
        title: editTitle,
        thumbnail: editThumbnail,
      });
      editing = false;
    } finally {
      saving = false;
    }
  }

  function cancel() {
    editing = false;
    if (w.data) {
      draft = w.data.content ?? '';
      editTitle = w.data.title;
      editThumbnail = w.data.thumbnail ?? '';
    }
  }

  async function del() {
    if (!w.data) return;
    await client.mutation(api.wiki.remove, { id: w.data._id });
    await goto(`/projects/${projectSlug()}/wiki`);
  }
</script>

<div class="space-y-4 p-6">
  {#if w.isLoading}
    <div class="h-64 animate-pulse rounded-lg bg-muted/20"></div>
  {:else if w.error}
    <div class="text-sm text-destructive">{w.error.toString()}</div>
  {:else if !w.data}
    <div class="text-sm text-muted-foreground">Page not found.</div>
  {:else}
    <div class="relative">
      {#if w.data.thumbnail && !editing}
        <div class="relative h-64 w-full overflow-hidden rounded-xl md:h-80">
          <img src={w.data.thumbnail} alt={w.data.title} class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-linear-to-t from-background/90 to-transparent"></div>
          <div class="absolute right-6 bottom-6 left-6">
            <h1 class="text-4xl font-bold tracking-tight text-white">{w.data.title}</h1>
            <div class="mt-2 text-sm text-white/80">
              Last edited: {new Date(w.data.lastEdited).toLocaleString()}
            </div>
          </div>
        </div>
      {:else if !editing}
        <div class="mb-8 space-y-4 border-b pb-6">
          <h1 class="text-4xl font-bold tracking-tight">{w.data.title}</h1>
          <div class="text-sm text-muted-foreground">
            Last edited: {new Date(w.data.lastEdited).toLocaleString()}
          </div>
        </div>
      {/if}

      <!-- Actions Toolbar -->
      {#if !editing}
        <div class="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="sm" class="backdrop-blur-sm" onclick={startEdit}>Edit</Button>
          <Button
            variant="destructive"
            size="sm"
            class="backdrop-blur-sm"
            onclick={() => {
              if (confirm('Are you sure you want to delete this page?')) del();
            }}>Delete</Button
          >
        </div>
      {/if}

      <div class="mt-8">
        {#if editing}
          <div class="space-y-4">
            <div class="grid gap-4">
              <div class="space-y-2">
                <label for="title" class="text-sm font-medium">Title</label>
                <Input id="title" bind:value={editTitle} />
              </div>
              <div class="space-y-2">
                <label for="thumbnail" class="text-sm font-medium">Thumbnail URL</label>
                <Input id="thumbnail" bind:value={editThumbnail} placeholder="https://..." />
              </div>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <div class="space-y-2">
                <div class="text-sm font-medium">Content (Markdown)</div>
                <Textarea class="min-h-[500px] font-mono" bind:value={draft} placeholder="Write markdown…" />
              </div>

              <div class="space-y-2">
                <div class="text-sm font-medium">Preview</div>
                <div class="prose prose-sm max-w-none overflow-auto rounded-md border bg-card p-6 dark:prose-invert">
                  {@html safeHtml(draft)}
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onclick={cancel} disabled={saving}>Cancel</Button>
              <Button onclick={save} disabled={saving}>
                {#if saving}Saving…{:else}Save Changes{/if}
              </Button>
            </div>
          </div>
        {:else}
          <div class="prose prose-lg max-w-none dark:prose-invert">
            {@html safeHtml(w.data.content ?? '')}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
