<script lang="ts">
  import MonitorIcon from '@lucide/svelte/icons/monitor';
  import MoonIcon from '@lucide/svelte/icons/moon';
  import SunIcon from '@lucide/svelte/icons/sun';
  import { useConvexClient } from 'convex-svelte';
  import { resetMode, setMode, userPrefersMode } from 'mode-watcher';

  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { api } from '$lib/convex/api';
  import { session, setSession } from '$lib/session';

  const client = useConvexClient();

  let name = $state($session?.name ?? '');
  let avatarURL = $state($session?.avatarURL ?? '');
  let isSaving = $state(false);

  $effect(() => {
    if ($session) {
      name = $session.name;
      avatarURL = $session.avatarURL ?? '';
    }
  });

  async function handleSave() {
    if (!$session) return;

    isSaving = true;
    try {
      await client.mutation(api.users.update, {
        id: $session.userId,
        name: name.trim() || undefined,
        avatarURL: avatarURL.trim() || undefined,
      });

      setSession({
        ...$session,
        name: name.trim() || $session.name,
        avatarURL: avatarURL.trim() || null,
      });
    } finally {
      isSaving = false;
    }
  }

  function getDiceBearUrl(seedName: string): string {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seedName)}`;
  }
</script>

<svelte:head>
  <title>Settings | Nanban</title>
</svelte:head>

<div class="container mx-auto max-w-2xl space-y-6 py-10">
  <Card>
    <CardHeader>
      <CardTitle>Profile</CardTitle>
      <CardDescription>Update your personal information.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="flex items-center gap-4">
        <Avatar class="h-20 w-20">
          <AvatarImage src={avatarURL || getDiceBearUrl(name || $session?.name || 'User')} alt="Avatar" />
          <AvatarFallback>{(name || $session?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div class="text-sm text-muted-foreground">Your avatar is shown across the app.</div>
      </div>

      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input id="name" type="text" placeholder="Your name" bind:value={name} />
      </div>

      <div class="space-y-2">
        <Label for="avatarURL">Avatar URL</Label>
        <Input id="avatarURL" type="url" placeholder="https://example.com/avatar.png" bind:value={avatarURL} />
        <p class="text-xs text-muted-foreground">Leave empty to use a generated avatar based on your name.</p>
      </div>

      <div class="flex justify-end">
        <Button onclick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Appearance</CardTitle>
      <CardDescription>Customize the look and feel of the application.</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="leading-none font-medium">Theme</div>
          <p class="text-sm text-muted-foreground">Select your preferred theme.</p>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onclick={() => setMode('light')}
            class={userPrefersMode.current === 'light'
              ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground'
              : ''}
            aria-label="Light"
          >
            <SunIcon class="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onclick={() => setMode('dark')}
            class={userPrefersMode.current === 'dark'
              ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground'
              : ''}
            aria-label="Dark"
          >
            <MoonIcon class="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onclick={() => resetMode()}
            class={userPrefersMode.current === 'system'
              ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground'
              : ''}
            title="System"
            aria-label="System"
          >
            <MonitorIcon class="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
