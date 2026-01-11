<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { loadSession, session } from '$lib/session';

	const { children } = $props();

	onMount(() => {
		// Load once on first mount
		loadSession();

		// Redirect if not logged in
		const unsub = session.subscribe((s) => {
			if (!s) goto('/login');
		});

		return unsub;
	});
</script>

{@render children()}
