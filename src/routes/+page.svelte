<script lang="ts">
  import { ExternalLink } from '@lucide/svelte';

  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';

  const users = [
    { name: 'Aisha Rahman', email: 'aisha@zurat.dev' },
    { name: 'Aminul Islam', email: 'aminul@zurat.dev' },
    { name: 'Arif Hasan', email: 'arif@zurat.dev' },
    { name: 'Farhana Akter', email: 'farhana@zurat.dev' },
    { name: 'Hasib Chowdhury', email: 'hasib@zurat.dev' },
    { name: 'Ishrat Jahan', email: 'ishrat@zurat.dev' },
    { name: 'Jubayer Hossain', email: 'jubayer@zurat.dev' },
    { name: 'Mahmud Hasan', email: 'mahmud@zurat.dev' },
    { name: 'Nusrat Karim', email: 'nusrat@zurat.dev' },
    { name: 'Rafi Ahmed', email: 'rafi@zurat.dev' },
    { name: 'Sadia Sultana', email: 'sadia@zurat.dev' },
    { name: 'Tanvir Rahman', email: 'tanvir@zurat.dev' },
  ];

  const pw = 'password123';

  const copy = (text: string) => navigator.clipboard.writeText(text);
</script>

<div class="mx-auto max-w-2xl px-6 py-12">
  <header class="mb-8 space-y-4">
    <h1 class="text-2xl font-bold">Demo Access</h1>

    <div class="flex items-center gap-2 rounded-lg border bg-muted p-3">
      <code class="flex-1 font-mono text-sm">Password: {pw}</code>
      <Button variant="ghost" size="sm" on:click={() => copy(pw)}>Copy</Button>
      <Separator orientation="vertical" class="h-4" />
      <Button size="sm" on:click={() => window.open('/login', '_blank')}>
        Login <ExternalLink class="ml-2 h-3 w-3" />
      </Button>
    </div>
  </header>

  <div class="space-y-1">
    {#each users as user}
      <div class="group flex items-center justify-between rounded-md p-2 hover:bg-accent">
        <div>
          <p class="text-sm leading-none font-medium">{user.name}</p>
          <p class="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" size="sm" class="h-8 text-xs" on:click={() => copy(user.email)}>Copy Email</Button>
      </div>
    {/each}
  </div>
</div>
