<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { Switch } from '$lib/components/ui/switch/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import { api, type Id } from '$lib/convex/api';
  import { session } from '$lib/session';

  const client = useConvexClient();
  const projectSlug = () => page.params.slug as string;

  const membersQ = useQuery(api.projects.membersBySlug, () => ({
    orgSlug: 'zurat',
    projectSlug: projectSlug(),
  }));

  let title = $state('');
  let description = $state('');
  let isImportant = $state(false);
  let isUrgent = $state(false);

  let assignee = $state<string>(''); // store as string for Select value
  let saving = $state(false);
  let error = $state<string | null>(null);

  function assigneeLabel() {
    const list = membersQ.data?.members ?? [];
    return list.find((m) => `${m._id}` === assignee)?.name ?? 'Select assignee';
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    error = null;

    if (!$session) {
      error = 'Not logged in';
      return;
    }
    if (!title.trim()) {
      error = 'Title is required';
      return;
    }
    if (!assignee) {
      error = 'Assignee is required';
      return;
    }

    saving = true;
    try {
      await client.mutation(api.tasks.createBySlug, {
        orgSlug: 'zurat',
        projectSlug: projectSlug(),
        title: title.trim(),
        description: description.trim(),
        assigneeID: assignee as unknown as Id<'users'>,
        reporterID: $session.userId,
        isImportant,
        isUrgent,
      });

      await goto(`/projects/${projectSlug()}/kanban`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create task';
    } finally {
      saving = false;
    }
  }
</script>

<div class="p-6">
  <Card.Root class="max-w-2xl">
    <Card.Header>
      <Card.Title>Create task</Card.Title>
      <Card.Description>Delegate a new task to a team member.</Card.Description>
    </Card.Header>

    <Card.Content class="space-y-6">
      {#if membersQ.isLoading}
        <div class="text-sm text-muted-foreground">Loading members…</div>
      {:else if membersQ.error}
        <div class="text-sm text-destructive">{membersQ.error.toString()}</div>
      {:else if !membersQ.data?.project}
        <div class="text-sm text-destructive">Project not found.</div>
      {:else}
        <form class="space-y-4" onsubmit={submit}>
          <div class="space-y-2">
            <Label for="title">Title</Label>
            <Input id="title" bind:value={title} placeholder="Short task title" />
          </div>

          <div class="space-y-2">
            <Label for="desc">Description</Label>
            <Textarea id="desc" rows={5} bind:value={description} placeholder="Details…" />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex items-center justify-between rounded-md border p-3">
              <div>
                <div class="text-sm font-medium">Important</div>
                <div class="text-xs text-muted-foreground">High impact</div>
              </div>
              <Switch bind:checked={isImportant} />
            </div>

            <div class="flex items-center justify-between rounded-md border p-3">
              <div>
                <div class="text-sm font-medium">Urgent</div>
                <div class="text-xs text-muted-foreground">Time sensitive</div>
              </div>
              <Switch bind:checked={isUrgent} />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Delegate to</Label>

            <Select.Root type="single" bind:value={assignee}>
              <Select.Trigger class="w-full justify-between">
                {assigneeLabel()}
              </Select.Trigger>

              <Select.Content>
                <Select.Group>
                  <Select.Label>Project members</Select.Label>

                  {#if (membersQ.data.members?.length ?? 0) === 0}
                    <div class="px-2 py-2 text-sm text-muted-foreground">No members yet.</div>
                  {:else}
                    {#each membersQ.data.members as m (m._id)}
                      <Select.Item value={`${m._id}`} label={m.name}>
                        <div class="flex items-center gap-2">
                          <Avatar.Root class="size-6">
                            {#if m.avatarURL}
                              <Avatar.Image src={m.avatarURL} alt={m.name} />
                            {/if}
                            <Avatar.Fallback>{m.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                          </Avatar.Root>
                          <span>{m.name}</span>
                        </div>
                      </Select.Item>
                    {/each}
                  {/if}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>

          {#if error}
            <div class="text-sm text-destructive">{error}</div>
          {/if}

          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" onclick={() => goto(`/projects/${projectSlug()}/kanban`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {#if saving}Creating…{:else}Create task{/if}
            </Button>
          </div>
        </form>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
