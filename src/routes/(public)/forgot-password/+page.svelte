<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let email = $state('');
</script>

<div class="flex min-h-dvh items-center justify-center p-6">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl">Forgot password</Card.Title>
			<Card.Description>This is a dummy page for now.</Card.Description>
		</Card.Header>

		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" bind:value={email} />
			</div>

			<div class="flex gap-2">
				<Button variant="outline" onclick={() => goto('/login')}>Back</Button>
				<Button disabled>Send reset link</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
