<script lang="ts">
  import {
    BookOpen,
    Building2,
    ChevronDown,
    ChevronUp,
    FolderKanban,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Plus,
    Settings,
    Table2,
    UserCheck,
    Users,
  } from '@lucide/svelte';
  import { useQuery } from 'convex-svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { api } from '$lib/convex/api';
  import { clearSession, session } from '$lib/session';

  const ORG_SLUG = 'nanban';
  const pathname = () => page.url.pathname;
  const isDashboard = () => pathname() === '/dashboard';
  const isProjectRoute = () => pathname().startsWith('/projects/');
  const projectSlug = () => page.params.slug as string | undefined;
  const projects = useQuery(api.projects.listForSidebar, () => ({ orgSlug: ORG_SLUG }));

  function nav(href: string) {
    goto(href);
  }

  function active(href: string) {
    return pathname() === href;
  }

  function activePrefix(prefix: string) {
    return pathname().startsWith(prefix);
  }

  function projectHref(slug: string, sub: string) {
    return `/projects/${slug}/${sub}`;
  }

  async function logout() {
    clearSession();
    await goto('/login');
  }
</script>

<Sidebar.Root>
  <Sidebar.Header class="px-2 py-2">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-md px-2 py-2 transition hover:bg-accent hover:text-accent-foreground"
        >
          <div class="flex min-w-0 items-center gap-2">
            <div class="grid size-8 shrink-0 place-items-center rounded-md border bg-background">
              <Building2 class="size-4" />
            </div>

            <div class="min-w-0 text-left">
              <div class="truncate text-sm leading-tight font-semibold">Nanban</div>
              <div class="truncate text-xs text-muted-foreground">
                {#if isProjectRoute() && projectSlug()}
                  {projectSlug()}
                {:else}
                  Company
                {/if}
              </div>
            </div>
          </div>

          <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="w-64" align="start">
        <DropdownMenu.Label>Switch project</DropdownMenu.Label>

        {#if projects.isLoading}
          <div class="px-2 py-2 text-sm text-muted-foreground">Loading…</div>
        {:else if projects.error}
          <div class="px-2 py-2 text-sm text-destructive">Failed to load projects</div>
        {:else if (projects.data?.length ?? 0) === 0}
          <div class="px-2 py-2 text-sm text-muted-foreground">No projects</div>
        {:else}
          {#each projects.data as p (p._id)}
            <DropdownMenu.Item onclick={() => nav(projectHref(p.slug, 'kanban'))}>
              {p.name}
            </DropdownMenu.Item>
          {/each}
        {/if}

        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={() => nav('/dashboard')}>Company dashboard</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Global</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={active('/dashboard')} onclick={() => nav('/dashboard')}>
              <LayoutDashboard class="size-4" />
              <span>Dashboard</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={activePrefix('/people')} onclick={() => nav('/people')}>
              <Users class="size-4" />
              <span>People</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>

          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={activePrefix('/chat')} onclick={() => nav('/chat')}>
              <MessageSquare class="size-4" />
              <span>Chat</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>

    {#if !isDashboard() && isProjectRoute() && projectSlug()}
      <Sidebar.Group>
        <Sidebar.GroupLabel>Project</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={active(projectHref(projectSlug()!, 'kanban'))}
                onclick={() => nav(projectHref(projectSlug()!, 'kanban'))}
              >
                <FolderKanban class="size-4" />
                <span>Kanban</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>

            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={active(projectHref(projectSlug()!, 'tasks/new'))}
                onclick={() => nav(projectHref(projectSlug()!, 'tasks/new'))}
              >
                <Plus class="size-4" />
                <span>New task</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>

            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={active(projectHref(projectSlug()!, 'tasks/all'))}
                onclick={() => nav(projectHref(projectSlug()!, 'tasks/all'))}
              >
                <Table2 class="size-4" />
                <span>All tasks</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>

            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={active(projectHref(projectSlug()!, 'tasks/mine'))}
                onclick={() => nav(projectHref(projectSlug()!, 'tasks/mine'))}
              >
                <UserCheck class="size-4" />
                <span>My tasks</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>

            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={activePrefix(projectHref(projectSlug()!, 'wiki'))}
                onclick={() => nav(projectHref(projectSlug()!, 'wiki'))}
              >
                <BookOpen class="size-4" />
                <span>Wiki</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    {/if}
  </Sidebar.Content>

  <Sidebar.Footer class="px-2 py-2">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-md px-2 py-2 transition hover:bg-accent hover:text-accent-foreground"
        >
          <div class="flex min-w-0 items-center gap-2">
            <Avatar.Root class="size-8 rounded-lg">
              <Avatar.Image src={$session?.avatarURL ?? ''} alt={$session?.name ?? 'User'} />
              <Avatar.Fallback class="rounded-lg">
                {$session?.name?.substring(0, 2)?.toUpperCase() ?? 'U'}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="min-w-0 text-left">
              <div class="truncate text-sm font-medium">{$session?.name ?? 'Guest'}</div>
              <div class="truncate text-xs text-muted-foreground">{$session?.email ?? ''}</div>
            </div>
          </div>
          <ChevronUp class="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="w-56" align="start">
        <DropdownMenu.Item onclick={() => nav('/settings')}>
          <Settings class="mr-2 size-4" />
          <span>Settings</span>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item onclick={logout}>
          <LogOut class="mr-2 size-4" />
          <span>Logout</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.Footer>
</Sidebar.Root>
