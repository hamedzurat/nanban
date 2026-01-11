<script lang="ts">
	import { goto } from '$app/navigation';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex/api';

	import { setSession } from '$lib/session';

	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	const client = useConvexClient();

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		loading = true;

		try {
			const res = await client.mutation(api.auth.login, { email, password });

			if (!res) {
				error = 'Invalid email or password.';
				return;
			}

			setSession({
				userId: res.userId,
				name: res.name,
				email: res.email,
				avatarURL: res.avatarURL
			});

			await goto('/dashboard');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-dvh items-center justify-center p-6">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl">Nanban</Card.Title>
			<Card.Description>Sign in to continue</Card.Description>
		</Card.Header>

		<Card.Content>
			<form class="space-y-4" onsubmit={onSubmit}>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" autocomplete="email" bind:value={email} required />
				</div>

				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						autocomplete="current-password"
						bind:value={password}
						required
					/>
				</div>

				{#if error}
					<div class="text-sm text-destructive">{error}</div>
				{/if}

				<div class="flex gap-2">
					<Button type="submit" disabled={loading} class="flex-1">
						{#if loading}Signing in...{:else}Login{/if}
					</Button>

					<Button type="button" variant="outline" onclick={() => goto('/forgot-password')}>
						Forgot password
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
