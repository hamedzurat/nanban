<script lang="ts">
  import { setupConvex } from 'convex-svelte';

  import { PUBLIC_CONVEX_URL } from '$env/static/public';

  import './layout.css';

  const { children } = $props();

  setupConvex(PUBLIC_CONVEX_URL);
</script>

{@render children()}
