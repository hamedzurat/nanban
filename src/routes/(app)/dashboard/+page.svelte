<script lang="ts">
	import { session, clearSession } from '$lib/session';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<div class="space-y-4 p-6">
	<h1 class="text-2xl font-semibold">Dashboard (placeholder)</h1>

	{#if $session}
		<div class="text-sm text-muted-foreground">
			Logged in as <span class="font-medium">{$session.name}</span> ({$session.email})
		</div>

		<Button variant="outline" onclick={clearSession}>Log out</Button>
	{/if}
</div>
