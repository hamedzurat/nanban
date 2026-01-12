<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import { api, type Id } from '$lib/convex/api';
  import { session } from '$lib/session';

  const client = useConvexClient();

  let chatSearch = $state('');
  let body = $state('');
  let sending = $state(false);

  function activeChatId(): string | null {
    return page.url.searchParams.get('c');
  }

  const inbox = useQuery(api.chats.inbox, () => ($session ? { orgSlug: 'zurat', userID: $session.userId } : 'skip')); // "skip" is supported

  function filteredChats() {
    const list = inbox.data ?? [];
    const q = chatSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.displayName.toLowerCase().includes(q));
  }

  // auto-select first chat if none chosen
  $effect(() => {
    const id = activeChatId();
    if (!id && (inbox.data?.length ?? 0) > 0) {
      const first = inbox.data![0];
      goto(`/chat?c=${first.chatID}`, { replaceState: true });
    }
  });

  const messages = useQuery(api.messages.listByChat, () => {
    const id = activeChatId();
    if (!id) return 'skip';
    return { chatID: id as unknown as Id<'chats'> };
  });

  function activeChat() {
    const id = activeChatId();
    if (!id) return null;
    const list = inbox.data ?? [];
    return list.find((c) => `${c.chatID}` === `${id}`) ?? null;
  }

  async function selectChat(chatID: Id<'chats'>) {
    await goto(`/chat?c=${chatID}`);
  }

  async function send() {
    if (!$session) return;
    const id = activeChatId();
    if (!id) return;

    const text = body.trim();
    if (!text) return;

    sending = true;
    try {
      await client.mutation(api.messages.send, {
        chatID: id as unknown as Id<'chats'>,
        senderID: $session.userId,
        body: text,
      });
      body = '';
    } finally {
      sending = false;
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  }
</script>

<div class="p-6">
  <div class="grid h-[calc(100dvh-6rem)] grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
    <!-- Inbox list -->
    <div class="rounded-lg border bg-card">
      <div class="space-y-3 p-3">
        {#if true}
          {@const a = activeChat()}
          <div class="flex items-center justify-between">
            <div class="font-semibold">Chats</div>
            {#if a}
              <Badge variant="secondary">{a.type}</Badge>
            {/if}
          </div>
        {/if}
        <Input placeholder="Search chats..." bind:value={chatSearch} />
      </div>

      <Separator />

      <ScrollArea class="h-[calc(100%-84px)]">
        <div class="p-2">
          {#if inbox.isLoading}
            <div class="p-3 text-sm text-muted-foreground">Loading…</div>
          {:else if inbox.error}
            <div class="p-3 text-sm text-destructive">{inbox.error.toString()}</div>
          {:else if filteredChats().length === 0}
            <div class="p-3 text-sm text-muted-foreground">No conversations.</div>
          {:else}
            <div class="space-y-1">
              {#each filteredChats() as c (c.chatID)}
                <button
                  type="button"
                  class="w-full rounded-md px-3 py-2 text-left transition hover:bg-accent hover:text-accent-foreground
                    {`${c.chatID}` === `${activeChatId()}` ? 'bg-accent text-accent-foreground' : ''}"
                  onclick={() => selectChat(c.chatID)}
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="truncate font-medium">{c.displayName}</div>
                    <div class="text-xs text-muted-foreground">{c.type}</div>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </ScrollArea>
    </div>

    <!-- Messages pane -->
    <div class="flex flex-col rounded-lg border bg-card">
      {#if true}
        {@const a = activeChat()}
        <div class="p-3">
          <div class="font-semibold">
            {#if a}{a.displayName}{:else}Select a chat{/if}
          </div>
          <div class="text-sm text-muted-foreground">
            {#if a}
              {a.type === 'ai'
                ? 'Dummy AI chat (no external AI wired)'
                : a.type === 'group'
                  ? 'Everyone group chat'
                  : 'Direct message'}
            {/if}
          </div>
        </div>
      {/if}

      <Separator />

      <ScrollArea class="flex-1">
        <div class="space-y-3 p-4">
          {#if !activeChatId()}
            <div class="text-sm text-muted-foreground">Pick a conversation on the left.</div>
          {:else if messages.isLoading}
            <div class="text-sm text-muted-foreground">Loading messages…</div>
          {:else if messages.error}
            <div class="text-sm text-destructive">{messages.error.toString()}</div>
          {:else if (messages.data?.length ?? 0) === 0}
            <div class="text-sm text-muted-foreground">No messages yet.</div>
          {:else}
            {#each messages.data as m (m._id)}
              <div class="space-y-1">
                <div class="text-sm break-words whitespace-pre-wrap">{m.body}</div>
                <div class="text-xs text-muted-foreground">{new Date(m.time).toLocaleString()}</div>
              </div>
            {/each}
          {/if}
        </div>
      </ScrollArea>

      <Separator />

      <div class="space-y-2 p-3">
        <Textarea
          placeholder="Write a message… (Ctrl/⌘ + Enter to send)"
          bind:value={body}
          onkeydown={onKeyDown}
          disabled={!activeChatId() || sending}
        />
        <div class="flex justify-end">
          <Button onclick={send} disabled={!activeChatId() || sending || body.trim().length === 0}>
            {#if sending}Sending…{:else}Send{/if}
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
