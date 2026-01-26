<script lang="ts">
  import DOMPurify from 'isomorphic-dompurify';
  import { marked } from 'marked';

  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as HoverCard from '$lib/components/ui/hover-card/index.js';

  interface Props {
    title: string;
    description?: string;
    status: string;
    isImportant: boolean;
    isUrgent: boolean;
    children?: import('svelte').Snippet;
  }

  let { title, description, status, isImportant, isUrgent, children }: Props = $props();

  function renderDescription(text: string) {
    const html = marked.parse(text) as string;
    return DOMPurify.sanitize(html);
  }
</script>

<HoverCard.Root>
  <HoverCard.Trigger>
    {@render children?.()}
  </HoverCard.Trigger>

  <HoverCard.Content class="w-96">
    <div class="space-y-3">
      <div class="font-semibold">{title}</div>
      <div
        class="prose prose-sm max-h-[300px] overflow-y-auto rounded-md bg-muted/50 p-3 text-sm text-foreground prose-invert dark:prose-invert prose-headings:mt-2 prose-headings:text-base prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-li:my-0"
      >
        {#if description}
          {@html renderDescription(description)}
        {:else}
          <span class="text-muted-foreground">No description.</span>
        {/if}
      </div>

      <div class="flex gap-2">
        {#if isImportant}<Badge>Important</Badge>{/if}
        {#if isUrgent}<Badge variant="destructive">Urgent</Badge>{/if}
        <Badge variant="secondary">{status}</Badge>
      </div>
    </div>
  </HoverCard.Content>
</HoverCard.Root>
