<script lang="ts">
  import { setupConvex } from 'convex-svelte';
  import { ModeWatcher } from 'mode-watcher';

  import { PUBLIC_CONVEX_URL } from '$env/static/public';

  import './layout.css';

  const { children } = $props();

  setupConvex(PUBLIC_CONVEX_URL);
</script>

<ModeWatcher />
{@render children()}
