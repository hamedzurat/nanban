<script lang="ts">
  import { setupConvex } from 'convex-svelte';
  import { ModeWatcher } from 'mode-watcher';

  import { PUBLIC_CONVEX_URL } from '$env/static/public';

  import './layout.css';

  const { children } = $props();

  const convexUrl = PUBLIC_CONVEX_URL || 'https://capable-pelican-238.convex.cloud';
  $inspect(convexUrl);
  setupConvex(convexUrl);
</script>

<ModeWatcher />
{@render children()}
