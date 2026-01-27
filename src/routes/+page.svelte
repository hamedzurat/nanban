<script lang="ts">
  import { ExternalLink } from '@lucide/svelte';

  import { browser } from '$app/environment';

  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';

  type DemoUser = { name: string; email: string };

  const users: DemoUser[] = [
    { name: 'Nabila Rahman', email: 'nabila@zurat.dev' },
    { name: 'Tahmid Hasan', email: 'tahmid@zurat.dev' },
    { name: 'Farhan Ahmed', email: 'farhan@zurat.dev' },
    { name: 'Mehnaz Islam', email: 'mehnaz@zurat.dev' },
    { name: 'Rafiq Uddin', email: 'rafiq@zurat.dev' },
    { name: 'Sadia Chowdhury', email: 'sadia@zurat.dev' },
    { name: 'Arif Mahmud', email: 'arif@zurat.dev' },
    { name: 'Nusrat Jahan', email: 'nusrat@zurat.dev' },
  ];

  const pw = 'password123';

  let copied: string | null = null;
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  function setCopied(label: string) {
    copied = label;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = null), 900);
  }

  async function copy(text: string, label = 'Copied') {
    if (!browser) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      return;
    } catch {
      // Fallback for non-secure contexts / older browsers
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(label);
      } catch {
        // If both fail, do nothing (or swap this for a toast)
      }
    }
  }

  function openLogin() {
    if (!browser) return;
    window.open('/login', '_blank', 'noopener,noreferrer');
  }
</script>

<svelte:head>
  <title>Demo Access | Nanban</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-12">
  <header class="mb-8 space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-bold">Demo Access</h1>
      {#if copied}
        <span class="text-xs text-muted-foreground">{copied}</span>
      {/if}
    </div>

    <div class="flex items-center gap-2 rounded-lg border bg-muted p-3">
      <code class="flex-1 font-mono text-sm">Password: {pw}</code>

      <!-- Native button wrapper (keyboard + a11y OK) -->
      <button type="button" class="contents" on:click={() => copy(pw, 'Password copied')}>
        <Button variant="ghost" size="sm">Copy</Button>
      </button>

      <Separator orientation="vertical" class="h-4" />

      <button type="button" class="contents" on:click={openLogin}>
        <Button size="sm">
          Login <ExternalLink class="ml-2 h-3 w-3" />
        </Button>
      </button>
    </div>
  </header>

  <div class="space-y-1">
    {#each users as user (user.email)}
      <div class="group flex items-center justify-between rounded-md p-2 hover:bg-accent">
        <div>
          <p class="text-sm leading-none font-medium">{user.name}</p>
          <p class="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <button type="button" class="contents" on:click={() => copy(user.email, `Email copied: ${user.name}`)}>
          <Button variant="outline" size="sm" class="h-8 text-xs">Copy Email</Button>
        </button>
      </div>
    {/each}
  </div>
</div>
