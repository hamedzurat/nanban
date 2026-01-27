<script lang="ts">
  import { setupConvex } from 'convex-svelte';
  import { ModeWatcher } from 'mode-watcher';

  import './layout.css';

  // import { PUBLIC_CONVEX_URL } from '$env/static/public';

  const { children } = $props();

  setupConvex('https://capable-pelican-238.convex.cloud');
  // setupConvex(PUBLIC_CONVEX_URL);
</script>

<ModeWatcher />
{@render children()}
