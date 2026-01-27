<script lang="ts">
  import { Save, Trash2, UserMinus, UserPlus } from '@lucide/svelte';
  import { useConvexClient, useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import { api, type Id } from '$lib/convex/api';

  type User = {
    _id: Id<'users'>;
    name: string;
    email: string;
    avatarURL: string | null;
  };

  const ORG_SLUG = 'nanban';
  const slug = () => page.params.slug as string;

  const client = useConvexClient();

  const projectQuery = useQuery(api.projects.getBySlug, () => ({
    orgSlug: ORG_SLUG,
    projectSlug: slug(),
  }));

  const membersQuery = useQuery(api.projects.membersBySlug, () => ({
    orgSlug: ORG_SLUG,
    projectSlug: slug(),
  }));

  const allUsersQuery = useQuery(api.people.listUsers, () => ({}));

  let name = $state('');
  let projectSlug = $state('');
  let description = $state('');
  let isSaving = $state(false);
  let isDeleting = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let hasInitialized = $state(false);
  let busyUserId = $state<string | null>(null);

  // Initialize form values when project data loads
  $effect(() => {
    if (projectQuery.data && !hasInitialized) {
      name = projectQuery.data.name;
      projectSlug = projectQuery.data.slug;
      description = projectQuery.data.description ?? '';
      hasInitialized = true;
    }
  });

  // Reset initialization flag when slug changes
  $effect(() => {
    const _ = slug();
    hasInitialized = false;
  });

  async function saveSettings() {
    if (!projectQuery.data) return;

    error = null;
    success = null;
    isSaving = true;

    try {
      await client.mutation(api.projects.update, {
        projectId: projectQuery.data._id,
        name: name.trim(),
        slug: projectSlug.trim(),
        description: description.trim() || undefined,
      });

      success = 'Project settings saved successfully';

      // Redirect if slug changed
      if (projectSlug.trim() !== slug()) {
        await goto(`/projects/${projectSlug.trim()}/settings`);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save settings';
    } finally {
      isSaving = false;
    }
  }

  async function deleteProject() {
    if (!projectQuery.data) return;
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;

    error = null;
    isDeleting = true;

    try {
      await client.mutation(api.projects.remove, {
        projectId: projectQuery.data._id,
      });
      await goto('/dashboard');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete project';
      isDeleting = false;
    }
  }

  async function addMember(userId: Id<'users'>) {
    if (!membersQuery.data?.project) return;
    busyUserId = `${userId}`;
    try {
      await client.mutation(api.projects.addMember, {
        projectID: membersQuery.data.project._id,
        userID: userId,
      });
    } finally {
      busyUserId = null;
    }
  }

  async function removeMember(userId: Id<'users'>) {
    if (!membersQuery.data?.project) return;
    busyUserId = `${userId}`;
    try {
      await client.mutation(api.projects.removeMember, {
        projectID: membersQuery.data.project._id,
        userID: userId,
      });
    } finally {
      busyUserId = null;
    }
  }

  const memberIds = $derived(new Set(membersQuery.data?.members.map((m) => `${m._id}`) ?? []));

  const currentMembers = $derived(membersQuery.data?.members ?? []);

  const nonMembers = $derived.by(() => {
    const all = (allUsersQuery.data ?? []) as User[];
    return all.filter((u) => !memberIds.has(`${u._id}`));
  });

  const isSlugValid = $derived(/^[a-z0-9-]+$/.test(projectSlug.trim()));
  const canSave = $derived(name.trim().length > 0 && projectSlug.trim().length > 0 && isSlugValid && !isSaving);
</script>

<svelte:head>
  <title>Settings - {page.params.slug} | Nanban</title>
</svelte:head>

<div class="space-y-6 p-6">
  <div>
    <h1 class="text-2xl font-semibold">Project Settings</h1>
    <p class="text-sm text-muted-foreground">Manage your project configuration</p>
  </div>

  {#if projectQuery.isLoading}
    <Card.Root>
      <Card.Header>
        <Skeleton class="h-6 w-48" />
        <Skeleton class="mt-2 h-4 w-64" />
      </Card.Header>
      <Card.Content class="space-y-4">
        <div class="space-y-2">
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="space-y-2">
          <Skeleton class="h-4 w-12" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="space-y-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-24 w-full" />
        </div>
      </Card.Content>
    </Card.Root>
  {:else if projectQuery.error}
    <Card.Root>
      <Card.Content class="py-6">
        <p class="text-destructive">Failed to load project: {projectQuery.error.toString()}</p>
      </Card.Content>
    </Card.Root>
  {:else if !projectQuery.data}
    <Card.Root>
      <Card.Content class="py-6">
        <p class="text-muted-foreground">Project not found</p>
      </Card.Content>
    </Card.Root>
  {:else}
    <Card.Root>
      <Card.Header>
        <Card.Title>General</Card.Title>
        <Card.Description>Basic project information</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-4">
        {#if error}
          <div class="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        {/if}
        {#if success}
          <div class="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-600">{success}</div>
        {/if}

        <div class="space-y-2">
          <Label for="name">Project Name</Label>
          <Input id="name" bind:value={name} placeholder="My Project" />
        </div>

        <div class="space-y-2">
          <Label for="slug">Slug</Label>
          <Input id="slug" bind:value={projectSlug} placeholder="my-project" />
          <p class="text-xs text-muted-foreground">
            URL-friendly identifier. Use lowercase letters, numbers, and hyphens only.
          </p>
          {#if projectSlug.trim() && !isSlugValid}
            <p class="text-xs text-destructive">Invalid slug format</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea id="description" bind:value={description} placeholder="What is this project about?" rows={4} />
        </div>
      </Card.Content>
      <Card.Footer>
        <Button disabled={!canSave} onclick={saveSettings}>
          <Save class="mr-2 size-4" />
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Card.Footer>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title>Members</Card.Title>
            <Card.Description>People who can access this project</Card.Description>
          </div>
          <Badge variant="secondary">{currentMembers.length} members</Badge>
        </div>
      </Card.Header>
      <Card.Content class="space-y-4">
        {#if membersQuery.isLoading || allUsersQuery.isLoading}
          <div class="space-y-2">
            {#each Array(3) as _}
              <div class="flex items-center justify-between rounded-md border p-3">
                <div class="flex items-center gap-3">
                  <Skeleton class="size-8 rounded-full" />
                  <Skeleton class="h-4 w-32" />
                </div>
                <Skeleton class="size-8" />
              </div>
            {/each}
          </div>
        {:else}
          {#if currentMembers.length > 0}
            <div>
              <p class="mb-2 text-sm font-medium">Current Members</p>
              <div class="space-y-2">
                {#each currentMembers as member (member._id)}
                  <div class="flex items-center justify-between rounded-md border p-3">
                    <div class="flex items-center gap-3">
                      <Avatar.Root class="size-8">
                        {#if member.avatarURL}
                          <Avatar.Image src={member.avatarURL} alt={member.name} />
                        {/if}
                        <Avatar.Fallback>{member.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                      </Avatar.Root>
                      <span class="text-sm font-medium">{member.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyUserId === `${member._id}`}
                      onclick={() => removeMember(member._id)}
                    >
                      <UserMinus class="size-4 text-destructive" />
                    </Button>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <p class="text-sm text-muted-foreground">No members in this project yet.</p>
          {/if}

          {#if nonMembers.length > 0}
            <div>
              <p class="mb-2 text-sm font-medium">Add Members</p>
              <div class="space-y-2">
                {#each nonMembers as user (user._id)}
                  <div class="flex items-center justify-between rounded-md border p-3">
                    <div class="flex items-center gap-3">
                      <Avatar.Root class="size-8">
                        {#if user.avatarURL}
                          <Avatar.Image src={user.avatarURL} alt={user.name} />
                        {/if}
                        <Avatar.Fallback>{user.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                      </Avatar.Root>
                      <div class="min-w-0">
                        <span class="text-sm font-medium">{user.name}</span>
                        <p class="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyUserId === `${user._id}`}
                      onclick={() => addMember(user._id)}
                    >
                      <UserPlus class="size-4" />
                    </Button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </Card.Content>
    </Card.Root>

    <Card.Root class="border-destructive">
      <Card.Header>
        <Card.Title class="text-destructive">Danger Zone</Card.Title>
        <Card.Description>Irreversible actions</Card.Description>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground">
          Deleting a project will permanently remove all tasks, wiki pages, and other associated data.
        </p>
      </Card.Content>
      <Card.Footer>
        <Button variant="destructive" disabled={isDeleting} onclick={deleteProject}>
          <Trash2 class="mr-2 size-4" />
          {isDeleting ? 'Deleting…' : 'Delete Project'}
        </Button>
      </Card.Footer>
    </Card.Root>
  {/if}
</div>
