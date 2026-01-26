<script lang="ts">
  import MonitorIcon from '@lucide/svelte/icons/monitor';
  import MoonIcon from '@lucide/svelte/icons/moon';
  import SunIcon from '@lucide/svelte/icons/sun';
  import { resetMode, setMode, userPrefersMode } from 'mode-watcher';

  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<div class="container mx-auto max-w-2xl py-10">
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
