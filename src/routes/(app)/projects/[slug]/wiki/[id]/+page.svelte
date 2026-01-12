<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import DOMPurify from 'isomorphic-dompurify';
  import { marked } from 'marked';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import { Button } from '$lib/components/ui/button/index.js';
  import * as Menubar from '$lib/components/ui/menubar/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import { api, type Id } from '$lib/convex/api';

  const client = useConvexClient();

  const wikiId = () => page.params.id as Id<'wiki'>;
  const projectSlug = () => page.params.slug as string;

  const w = useQuery(api.wiki.get, () => ({ id: wikiId() }));

  let editing = $state(false);
  let draft = $state('');
  let saving = $state(false);

  $effect(() => {
    if (w.data && !editing) draft = w.data.content ?? '';
  });

  function safeHtml(md: string) {
    // Marked does NOT sanitize; sanitize the generated HTML.
    const html = marked.parse(md);
    return DOMPurify.sanitize(html);
  }

  async function startEdit() {
    if (!w.data) return;
    draft = w.data.content ?? '';
    editing = true;
  }

  async function save() {
    if (!w.data) return;
    saving = true;
    try {
      await client.mutation(api.wiki.updateContent, { id: w.data._id, content: draft });
      editing = false;
    } finally {
      saving = false;
    }
  }

  function cancel() {
    editing = false;
    draft = w.data?.content ?? '';
  }

  async function del() {
    if (!w.data) return;
    await client.mutation(api.wiki.remove, { id: w.data._id });
    await goto(`/projects/${projectSlug()}/wiki`);
  }
</script>

<div class="space-y-4 p-6">
  {#if w.isLoading}
    <div class="text-sm text-muted-foreground">Loading…</div>
  {:else if w.error}
    <div class="text-sm text-destructive">{w.error.toString()}</div>
  {:else if !w.data}
    <div class="text-sm text-muted-foreground">Page not found.</div>
  {:else}
    <div class="space-y-2">
      <div class="text-2xl font-semibold">{w.data.title}</div>
      <div class="text-sm text-muted-foreground">
        Last edited: {new Date(w.data.lastEdited).toLocaleString()}
      </div>
    </div>

    <!-- Menu bar (Edit / Save / Delete etc) -->
    <Menubar.Root>
      <Menubar.Menu>
        <Menubar.Trigger>Page</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item onclick={startEdit} disabled={editing}>Edit</Menubar.Item>
          <Menubar.Item onclick={save} disabled={!editing || saving}>Save</Menubar.Item>
          <Menubar.Item onclick={cancel} disabled={!editing}>Cancel</Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item onclick={del} class="text-destructive">Delete</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>

    {#if editing}
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="space-y-2">
          <div class="text-sm font-medium">Edit</div>
          <Textarea rows={18} bind:value={draft} placeholder="Write markdown…" />
          <div class="flex justify-end gap-2">
            <Button variant="outline" onclick={cancel} disabled={saving}>Cancel</Button>
            <Button onclick={save} disabled={saving}
              >{#if saving}Saving…{:else}Save{/if}</Button
            >
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-sm font-medium">Preview</div>
          <div class="prose prose-sm max-w-none overflow-auto rounded-md border bg-background p-4">
            {@html safeHtml(draft)}
          </div>
        </div>
      </div>
    {:else}
      <div class="prose prose-sm max-w-none rounded-md border bg-background p-4">
        {@html safeHtml(w.data.content ?? '')}
      </div>
    {/if}
  {/if}
</div>
