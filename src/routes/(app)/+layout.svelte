<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';

  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { loadSession, session } from '$lib/session';

  const { children } = $props();

  onMount(() => {
    loadSession();
    const unsub = session.subscribe((s) => {
      if (!s) goto('/login');
    });
    return unsub;
  });
</script>

<Sidebar.Provider>
  <AppSidebar />

  <main class="flex-1">
    <div class="p-2">
      <Sidebar.Trigger />
    </div>

    {@render children()}
  </main>
</Sidebar.Provider>
