<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import { formatDistanceToNow } from 'date-fns';
  import Fuse from 'fuse.js';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
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
    const q = chatSearch.trim();
    if (!q) return list;
    const fuse = new Fuse(list, { keys: ['displayName'], threshold: 0.4 });
    return fuse.search(q).map((r) => r.item);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }
</script>

<div class="p-6">
  <div class="grid h-[calc(100dvh-6rem)] grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
    <!-- Inbox list -->
    <div class="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
      <div class="space-y-3 p-3">
        {#if true}
          {@const a = activeChat()}
          <div class="flex items-center justify-between">
            <div class="font-semibold">Chats</div>
          </div>
        {/if}
        <Input placeholder="Search chats..." bind:value={chatSearch} />
      </div>

      <Separator />

      <ScrollArea class="min-h-0 flex-1">
        <div class="p-2">
          {#if inbox.isLoading}
            <div class="space-y-2 p-3">
              <div class="flex items-center gap-3">
                <Skeleton class="h-10 w-10 rounded-full" />
                <div class="space-y-2">
                  <Skeleton class="h-4 w-[150px]" />
                  <Skeleton class="h-3 w-[100px]" />
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Skeleton class="h-10 w-10 rounded-full" />
                <div class="space-y-2">
                  <Skeleton class="h-4 w-[150px]" />
                  <Skeleton class="h-3 w-[100px]" />
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Skeleton class="h-10 w-10 rounded-full" />
                <div class="space-y-2">
                  <Skeleton class="h-4 w-[150px]" />
                  <Skeleton class="h-3 w-[100px]" />
                </div>
              </div>
            </div>
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
                  <div class="flex items-center gap-3">
                    <Avatar.Root>
                      <Avatar.Image
                        src={c.avatarURL ?? `https://api.dicebear.com/9.x/thumbs/svg?seed=${c.displayName}`}
                        alt={c.displayName}
                      />
                      <Avatar.Fallback>{c.displayName.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                    </Avatar.Root>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <div class="truncate font-medium">{c.displayName}</div>
                        <Badge variant="secondary" class="h-5 px-1 py-0 text-[10px]">{c.type}</Badge>
                      </div>
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </ScrollArea>
    </div>

    <!-- Messages pane -->
    <div class="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
      {#if true}
        {@const a = activeChat()}
        <div class="flex items-center justify-between p-3">
          <div class="flex items-center gap-3">
            {#if a}
              <Avatar.Root>
                <Avatar.Image
                  src={a.avatarURL ?? `https://api.dicebear.com/9.x/thumbs/svg?seed=${a.displayName}`}
                  alt={a.displayName}
                />
                <Avatar.Fallback>{a.displayName.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
            {/if}
            <div>
              <div class="font-semibold">
                {#if a}{a.displayName}{:else}Select a chat{/if}
              </div>
            </div>
          </div>
          {#if a}
            <Badge variant="secondary">{a.type}</Badge>
          {/if}
        </div>
      {/if}

      <Separator />

      <ScrollArea class="min-h-0 flex-1">
        <div class="space-y-3 p-4">
          {#if !activeChatId()}
            <div class="text-sm text-muted-foreground">Pick a conversation on the left.</div>
          {:else if messages.isLoading}
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Skeleton class="h-8 w-8 rounded-full" />
                <div class="space-y-2">
                  <Skeleton class="h-4 w-[200px]" />
                  <Skeleton class="h-4 w-[150px]" />
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Skeleton class="h-8 w-8 rounded-full" />
                <div class="space-y-2">
                  <Skeleton class="h-4 w-[180px]" />
                  <Skeleton class="h-4 w-[220px]" />
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Skeleton class="h-8 w-8 rounded-full" />
                <div class="space-y-2">
                  <Skeleton class="h-4 w-[240px]" />
                  <Skeleton class="h-4 w-[100px]" />
                </div>
              </div>
            </div>
          {:else if messages.error}
            <div class="text-sm text-destructive">{messages.error.toString()}</div>
          {:else if (messages.data?.length ?? 0) === 0}
            <div class="text-sm text-muted-foreground">No messages yet.</div>
          {:else}
            {#each messages.data as m (m._id)}
              <div class="flex items-start gap-3">
                <Avatar.Root class="mt-1 h-8 w-8">
                  <Avatar.Image
                    src={m.sender?.avatarURL ??
                      `https://api.dicebear.com/9.x/thumbs/svg?seed=${m.sender?.name ?? 'Anonymous'}`}
                    alt={m.sender?.name}
                  />
                  <Avatar.Fallback>{m.sender?.name?.slice(0, 2).toUpperCase() ?? '??'}</Avatar.Fallback>
                </Avatar.Root>
                <div class="w-full space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    {#if m.sender}
                      <div class="text-xs font-semibold text-muted-foreground">{m.sender.name}</div>
                    {:else}
                      <div class="text-xs font-semibold text-muted-foreground">Unknown</div>
                    {/if}
                    <div class="text-xs text-muted-foreground" title={new Date(m.time).toLocaleString()}>
                      {formatDistanceToNow(m.time, { addSuffix: true })}
                    </div>
                  </div>
                  <div class="text-sm wrap-break-word whitespace-pre-wrap">{m.body}</div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </ScrollArea>

      <Separator />

      <div class="space-y-2 p-3">
        <Textarea
          placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
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
