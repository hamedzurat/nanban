<script lang="ts">
  import { setupConvex } from 'convex-svelte';
  import { ModeWatcher } from 'mode-watcher';

  import './layout.css';

  const { children } = $props();

  setupConvex('https://capable-pelican-238.convex.cloud');
</script>

<ModeWatcher />
{@render children()}
