import { v } from 'convex/values';

import type { DataModel, Id } from './_generated/dataModel';
import { mutation } from './_generated/server';

// ─────────────────────────────────────────────────────────────────────────────
// DATA DEFINITIONS - Edit these to add entries
// ─────────────────────────────────────────────────────────────────────────────

const ORG = { name: 'The Game Studio', slug: 'nanban' };

// 8 USERS (Bangladeshi names)
const USERS = [
  { name: 'Nabila Rahman', email: 'nabila@zurat.dev' },
  { name: 'Tahmid Hasan', email: 'tahmid@zurat.dev' },
  { name: 'Farhan Ahmed', email: 'farhan@zurat.dev' },
  { name: 'Mehnaz Islam', email: 'mehnaz@zurat.dev' },
  { name: 'Rafiq Uddin', email: 'rafiq@zurat.dev' },
  { name: 'Sadia Chowdhury', email: 'sadia@zurat.dev' },
  { name: 'Arif Mahmud', email: 'arif@zurat.dev' },
  { name: 'Nusrat Jahan', email: 'nusrat@zurat.dev' },
] as const;

// 6 PROJECTS (4 games + CI/CD + Internal tools)
const PROJECTS = [
  {
    slug: 'ashen-frontier',
    name: 'Ashen Frontier',
    description: 'Third-person action RPG with stamina combat and exploration.',
    createdBy: 'nabila@zurat.dev',
    members: ['nabila@zurat.dev', 'tahmid@zurat.dev', 'mehnaz@zurat.dev', 'sadia@zurat.dev', 'rafiq@zurat.dev'],
  },
  {
    slug: 'drift-district',
    name: 'Drift District',
    description: 'Mobile kart racer with drift mastery and seasonal events.',
    createdBy: 'nusrat@zurat.dev',
    members: ['nusrat@zurat.dev', 'tahmid@zurat.dev', 'mehnaz@zurat.dev', 'sadia@zurat.dev', 'rafiq@zurat.dev'],
  },
  {
    slug: 'skybound-tactics',
    name: 'Skybound Tactics',
    description: 'Turn-based squad tactics with roguelite runs.',
    createdBy: 'tahmid@zurat.dev',
    members: ['tahmid@zurat.dev', 'nabila@zurat.dev', 'mehnaz@zurat.dev', 'rafiq@zurat.dev'],
  },
  {
    slug: 'neon-heist-online',
    name: 'Neon Heist Online',
    description: 'Co-op stealth shooter with matchmaking and progression.',
    createdBy: 'arif@zurat.dev',
    members: ['arif@zurat.dev', 'tahmid@zurat.dev', 'farhan@zurat.dev', 'nabila@zurat.dev', 'rafiq@zurat.dev'],
  },
  {
    slug: 'ci-cd',
    name: 'CI/CD',
    description: 'Build automation, releases, and CI stability improvements.',
    createdBy: 'farhan@zurat.dev',
    members: ['farhan@zurat.dev', 'arif@zurat.dev', 'tahmid@zurat.dev', 'rafiq@zurat.dev'],
  },
  {
    slug: 'internal-tools',
    name: 'Internal tools',
    description: 'Studio apps for tasks, wiki, chat, and permissions.',
    createdBy: 'mehnaz@zurat.dev',
    members: ['mehnaz@zurat.dev', 'farhan@zurat.dev', 'nabila@zurat.dev', 'rafiq@zurat.dev', 'nusrat@zurat.dev'],
  },
] as const;

type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done' | 'canceled';

interface TaskDef {
  title: string;
  description: string;
  assignee: string;
  reporter: string;
  status: TaskStatus;
  isImportant: boolean;
  isUrgent: boolean;
  dueInDays: number;
}

// ~20 TASKS PER PROJECT, explicit and realistic (no task-to-task dependencies)
const TASKS: Record<string, TaskDef[]> = {
  'ashen-frontier': [
    {
      title: 'Implement stamina drain + regen tuning',
      description: `## Goal\nMake stamina feel responsive and readable during combat.\n\n## Acceptance Criteria\n- Sprint drains 10/s\n- Dodge costs 25 stamina\n- Regen starts after 2s of no stamina spend\n- Regen ramps smoothly (no jump)\n\n## Notes\nHook into combat state machine for "in combat" bias.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 7,
    },
    {
      title: 'Fix dodge roll blend snap from sprint',
      description: `## Bug\nDodge animation snaps when triggered while sprinting.\n\n## Steps to Reproduce\n1. Sprint forward\n2. Press dodge\n3. Observe abrupt pose transition\n\n## Acceptance Criteria\n- Transition uses correct blend tree\n- No foot sliding\n- Works for controller + keyboard`,
      assignee: 'sadia@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 3,
    },
    {
      title: 'Add ember particles to Fire Bolt',
      description: `## Visual Update\nFire Bolt feels flat in motion.\n\n## Acceptance Criteria\n- Embers trail while projectile moves\n- Small impact burst with smoke puff\n- Optional heat shimmer toggle for performance`,
      assignee: 'sadia@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: false,
      isUrgent: false,
      dueInDays: 5,
    },
    {
      title: 'HUD: stamina + status icon layout pass',
      description: `## UI/UX\nRework HUD spacing for stamina, buffs, and debuffs.\n\n## Acceptance Criteria\n- Stamina is always visible during combat\n- Buff icons wrap (max 2 rows)\n- Works at 16:9 and 21:9\n\n## Mock\nPlace stamina below health, aligned left.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'Audio: surface-based footsteps',
      description: `## Audio\nFootsteps should match surface materials.\n\n## Acceptance Criteria\n- Stone / grass / wood / water\n- Correct sound plays based on physics material\n- Volume scales with movement speed\n\n## QA\nVerify in rain + shallow puddles.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'sadia@zurat.dev',
      status: 'in-progress',
      isImportant: false,
      isUrgent: false,
      dueInDays: 4,
    },
    {
      title: 'Optimize texture streaming radius',
      description: `## Performance\nTexture pop-in is noticeable after fast travel.\n\n## Acceptance Criteria\n- Reduced pop-in within 2 seconds after spawn\n- No >10% memory increase\n- Add debug overlay for streaming priority\n\n## Notes\nTune preload radius for mounted traversal.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -3,
    },
    {
      title: 'Design Chapter 3 boss arena layout',
      description: `## Design\nCreate a playable arena for the Chapter 3 boss encounter.\n\n## Requirements\n- Supports 2 phases with arena changes\n- Clear sightlines for projectile attacks\n- Safe zones for tutorial beats\n\n## Deliverable\nTop-down blockout + notes.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 10,
    },
    {
      title: 'Combat: guard meter for enemies',
      description: `## Feature\nAdd enemy guard meter to enable heavy attacks to break defense.\n\n## Acceptance Criteria\n- Meter increases when blocking\n- Heavy hits reduce guard\n- Guard break staggers enemy for 1.2s\n\n## UI\nSmall bar above enemy health when locked-on.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -1,
    },
    {
      title: 'Quest log: filter by region',
      description: `## UX\nQuest list is getting long. Add region filters.\n\n## Acceptance Criteria\n- Filter by region + "Active"\n- Remember last filter per session\n- No layout shift when toggling\n\n## Notes\nKeep fast navigation for controller.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -4,
    },
    {
      title: 'Bug: interact prompt flickers near ladders',
      description: `## Bug\nInteract prompt flickers when player is near ladder volumes.\n\n## Steps\n1. Walk along ladder edge\n2. Rotate camera\n3. Prompt appears/disappears rapidly\n\n## Acceptance Criteria\n- Stable prompt when within range\n- No duplicate prompts\n- Works with multiple interactables nearby`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: true,
      dueInDays: 2,
    },
    {
      title: 'Add ambient SFX for corrupted zones',
      description: `## Audio\nCorrupted areas feel too quiet.\n\n## Acceptance Criteria\n- Low rumble bed + distant whispers\n- Occasional one-shot stingers\n- Volume reacts to proximity of corruption nodes\n\n## Notes\nKeep it subtle (no jump scares).`,
      assignee: 'sadia@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 9,
    },
    {
      title: 'Polish: camera collision smoothing',
      description: `## Polish\nCamera clips on tight corners indoors.\n\n## Acceptance Criteria\n- Smooth push-in with spring\n- No sudden FOV jumps\n- Maintains lock-on framing\n\n## QA\nTest in dungeon hallways + stairs.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 8,
    },
    {
      title: 'Add mini-map fog-of-war toggle',
      description: `## UI/Feature\nAllow players to toggle fog-of-war on the mini-map.\n\n## Acceptance Criteria\n- Setting in Options > UI\n- Toggle updates immediately\n- Persist setting across sessions\n\n## Note\nDefault stays ON for new players.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -9,
    },
    {
      title: 'Performance: reduce CPU spikes on NPC crowds',
      description: `## Performance\nTown square has CPU spikes when NPC count > 30.\n\n## Acceptance Criteria\n- Peak frame time reduced by 20%\n- No visible behavior regressions\n- Add profiler marker around schedule updates\n\n## Notes\nConsider batched AI ticks.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -5,
    },
    {
      title: 'UI: inventory compare panel',
      description: `## UX\nAdd a compare panel when hovering equipment.\n\n## Acceptance Criteria\n- Shows delta stats (green/red)\n- Works for weapons + armor\n- Controller-friendly focus navigation\n\n## Notes\nKeep panel minimal for readability.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 12,
    },
    {
      title: 'Art: pass on dungeon prop set',
      description: `## Art\nCreate a consistent prop set for early dungeons.\n\n## Deliverables\n- 12 props (crates, chains, brazier, rubble)\n- 2 material variants (clean/aged)\n- Prefabs aligned to grid\n\n## Acceptance\nNo overlapping UVs, LODs included.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -1,
    },
    {
      title: 'QA: combat feel checklist for sprint review',
      description: `## QA\nRun a short combat feel pass before sprint review.\n\n## Checklist\n- Stamina behavior\n- Hit pause readability\n- Dodge i-frames consistency\n- Target lock stability\n\n## Output\nWrite 6-10 bullet notes in QA channel.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 1,
    },
    {
      title: 'Bug: fire VFX looks washed out in HDR',
      description: `## Bug\nFire effects appear overly bright in HDR scenes.\n\n## Acceptance Criteria\n- Clamp emission correctly\n- Preserve color gradients\n- No bloom artifacts\n\n## QA\nTest sunrise area + boss arena.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'Add controller vibration for heavy hits',
      description: `## Feature\nAdd light haptics for heavy attacks and parries.\n\n## Acceptance Criteria\n- Heavy attack: short strong pulse\n- Parry success: sharp click\n- Toggle in Accessibility\n\n## Notes\nKeep intensity under platform guidelines.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -2,
    },
    {
      title: 'Temporary auto-lock during sprint',
      description: `## Experiment\nPrototype auto-lock while sprinting into combat.\n\n## Result\nFelt intrusive and caused camera fights during group battles.\n\n## Decision\nKeep manual lock-on; revisit after enemy AI overhaul.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'canceled',
      isImportant: false,
      isUrgent: false,
      dueInDays: 30,
    },
  ],

  'drift-district': [
    {
      title: 'Tune drift sensitivity for touch controls',
      description: `## Goal\nReduce complaints about over-steering on drift.\n\n## Acceptance Criteria\n- New default sensitivity lowered by 15%\n- Add "Steering Assist" toggle\n- No regression for controller input\n\n## QA\nTest on 3 Android devices + iPhone SE.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: true,
      dueInDays: 2,
    },
    {
      title: 'Fix kart clipping through guardrails on Curve 3',
      description: `## Bug\nKarts can clip through guardrail at high speed on Curve 3 (Neon Boulevard track).\n\n## Steps\n1. Use boost before Curve 3\n2. Drift wide\n3. Kart may pass through collision\n\n## Acceptance Criteria\n- No clip at max speed\n- No invisible wall feel\n- Verified on 30FPS devices`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 1,
    },
    {
      title: 'Add drift spark feedback (white → yellow → orange)',
      description: `## VFX\nPlayers need clearer drift charge feedback.\n\n## Acceptance Criteria\n- 3 stages with distinct colors\n- Sparks intensify as charge grows\n- Works in low graphics mode\n\n## Notes\nAvoid heavy particle counts on mobile.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: false,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'Balance boost power-up duration + speed',
      description: `## Design\nBoost feels too long and too safe.\n\n## Proposed\n- Duration: 5s → 3s\n- Speed bonus: 20% → 30%\n\n## Acceptance Criteria\n- Measurable lap time improvement\n- Not mandatory for win\n- Feels punchy with SFX feedback`,
      assignee: 'nabila@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'done',
      isImportant: false,
      isUrgent: false,
      dueInDays: -1,
    },
    {
      title: 'UI: race end summary readability pass',
      description: `## UI/UX\nEnd-of-race screen feels busy on small phones.\n\n## Acceptance Criteria\n- Show top 3 with big medals\n- Player row pinned + highlighted\n- Buttons reachable with one thumb\n\n## Notes\nKeep animations under 1.5s.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 7,
    },
    {
      title: 'Audio: new boost activation SFX',
      description: `## Audio\nBoost activation needs more "snap" and clarity.\n\n## Acceptance Criteria\n- Short whoosh + low thump\n- Volume ducking for engine for 0.2s\n- No harsh peaks on cheap speakers`,
      assignee: 'sadia@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 8,
    },
    {
      title: 'Performance: reduce FPS drops on Rainy Harbor',
      description: `## Performance\nRain + reflections cause FPS drops on mid-range devices.\n\n## Acceptance Criteria\n- Maintain 55-60 FPS on target device\n- Reflection quality scales with graphics setting\n- Particle budget cap applied\n\n## Notes\nConsider baked cubemaps for low mode.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -7,
    },
    {
      title: 'Add beach themed track blockout',
      description: `## Track Design\nSummer update needs a beach track.\n\n## Requirements\n- 2 shortcuts\n- One underwater tunnel section\n- 3 boost pad lines\n\n## Deliverable\nGreybox playable track + minimap render.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 9,
    },
    {
      title: 'Bug: item roulette sometimes shows blank icon',
      description: `## Bug\nRandomly, item roulette displays an empty slot before landing.\n\n## Steps\n1. Pick up item box\n2. Immediately drift\n3. Observe blank icon flash\n\n## Acceptance Criteria\n- No blank icons\n- Item resolves consistently\n- No extra GC spikes`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: true,
      dueInDays: 2,
    },
    {
      title: 'Add daily challenge: “Perfect Drifts”',
      description: `## Live Ops\nAdd a daily challenge focused on drifts.\n\n## Acceptance Criteria\n- Track: rotates daily\n- Objective: chain 5 perfect drifts\n- Reward: coins + cosmetic shards\n\n## Notes\nKeep it doable in <5 minutes.`,
      assignee: 'nusrat@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -4,
    },
    {
      title: 'Analytics: log drift usage + crash-free rate',
      description: `## Telemetry\nWe need data for drift changes impact.\n\n## Acceptance Criteria\n- Log drift start/end count\n- Log drift tier reached\n- Track crash-free sessions by device\n\n## Privacy\nNo PII in events.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'QA: regression pass on touch controls',
      description: `## QA\nRun a regression pass after drift tuning.\n\n## Checklist\n- Steering baseline\n- Drift entry timing\n- Boost activation\n- Pause/resume\n\n## Output\nShare results in QA / Playtests channel.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 3,
    },
    {
      title: 'UI: shop preview for boost trails',
      description: `## UI\nAdd preview animation for boost trails in shop.\n\n## Acceptance Criteria\n- Preview loop < 6s\n- Does not block scrolling\n- Works offline with cached assets\n\n## Notes\nKeep memory under 40MB additional.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -8,
    },
    {
      title: 'Art: new kart skin set “Sunset Runner”',
      description: `## Art\nCreate a premium kart skin set for the beach season.\n\n## Deliverables\n- 3 color variants\n- Matching wheels\n- Icon + shop card render\n\n## Acceptance\nMaterial budget within mobile limits.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 11,
    },
    {
      title: 'Tools: automate track minimap export',
      description: `## Pipeline\nMinimap export is manual and inconsistent.\n\n## Acceptance Criteria\n- One-click export from editor\n- Outputs PNG + JSON scale info\n- Standardized naming convention\n\n## Notes\nStore output under /Tracks/Minimaps.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -3,
    },
    {
      title: 'Bug: occasional desync in online ghost races',
      description: `## Bug\nGhost replays sometimes drift off the track after lap 2.\n\n## Acceptance Criteria\n- Ghost follows recorded path consistently\n- Replay deterministic across frame rates\n- No extra bandwidth usage\n\n## QA\nTest 10 replays on low-end devices.`,
      assignee: 'arif@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -11,
    },
    {
      title: 'Add “Quick Chat” stickers in lobby',
      description: `## Feature\nLobby needs light social expression.\n\n## Acceptance Criteria\n- 8 stickers\n- Rate limit to avoid spam\n- Mute option in Settings\n\n## Notes\nNo text entry for now.`,
      assignee: 'nusrat@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 13,
    },
    {
      title: 'Remove drift auto-correction entirely',
      description: `## Experiment\nTried removing drift auto-correction.\n\n## Result\nMade the game feel too punishing on touch controls.\n\n## Decision\nKeep assist but make it adjustable.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'canceled',
      isImportant: false,
      isUrgent: false,
      dueInDays: 30,
    },
    {
      title: 'Polish: new countdown animation',
      description: `## Polish\nCountdown feels flat. Add punchy animation + SFX.\n\n## Acceptance Criteria\n- 3-2-1-GO with scale pop\n- Subtle camera shake on GO\n- Skippable in Accessibility (reduce motion)`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 5,
    },
    {
      title: 'Matchmaking: region preference toggle',
      description: `## Online\nPlayers want lower latency matches.\n\n## Acceptance Criteria\n- Toggle: "Prefer Nearby"\n- Falls back to global after 15s\n- Visible ping indicator in lobby\n\n## Notes\nDo not split population too hard.`,
      assignee: 'arif@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -4,
    },
    {
      title: 'Bug: kart shadow jitter on low FPS',
      description: `## Bug\nKart shadow jitters when FPS drops below 30.\n\n## Acceptance Criteria\n- Stable shadow projection\n- No shimmer artifacts\n- Does not increase render cost noticeably`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 10,
    },
  ],

  'skybound-tactics': [
    {
      title: 'Implement grid targeting with hover preview',
      description: `## Feature\nAdd grid hover preview for attacks and movement.\n\n## Acceptance Criteria\n- Highlight move range and attack tiles\n- Show projected damage\n- Works with mouse + controller\n\n## Notes\nKeep animation snappy (<120ms).`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'Fix camera rotate stutter on large maps',
      description: `## Bug\nCamera rotation stutters on large procedural maps.\n\n## Acceptance Criteria\n- Smooth rotation at 60 FPS\n- No hitch during pathfinding preview\n- Works on low graphics settings\n\n## Notes\nCheck allocations during camera lerp.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 3,
    },
    {
      title: 'UI: squad loadout screen layout',
      description: `## UI\nLoadout screen needs clearer hierarchy.\n\n## Acceptance Criteria\n- Equipment left, stats right\n- Perk list scrolls independently\n- Quick swap for weapons\n\n## Notes\nDesign for gamepad first.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 9,
    },
    {
      title: 'Add ability VFX: “Shock Net”',
      description: `## VFX\nNew crowd control ability needs readable VFX.\n\n## Acceptance Criteria\n- Net appears on targeted tiles\n- Electrical pulses every 0.5s\n- Clear end state (fade out)\n\n## Notes\nAvoid noisy particles in dense fights.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: false,
      isUrgent: false,
      dueInDays: 7,
    },
    {
      title: 'Audio: ability confirmation sounds',
      description: `## Audio\nAdd distinct confirmation sounds per ability category.\n\n## Acceptance Criteria\n- Attack: sharp\n- Support: warm\n- Control: electrical\n\n## Notes\nKeep volume consistent with UI clicks.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -7,
    },
    {
      title: 'Design: rebalance early enemy HP curve',
      description: `## Balance\nEarly fights feel too spongey.\n\n## Acceptance Criteria\n- Reduce enemy HP by 10-12% for floors 1-2\n- Keep boss HP unchanged\n- Preserve difficulty using enemy skill choices\n\n## Notes\nRe-test with starter squad.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 5,
    },
    {
      title: 'Add icons for status effects (Burn, Shock, Root)',
      description: `## UI/Art\nPlayers miss status effects. Add clear icons and tooltips.\n\n## Acceptance Criteria\n- 12x12 in combat HUD\n- Tooltip on hover\n- Stack counts shown\n\n## Notes\nEnsure color-blind friendly shapes.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 8,
    },
    {
      title: 'Bug: path preview sometimes chooses invalid route',
      description: `## Bug\nPath preview occasionally routes through blocked tiles.\n\n## Steps\n1. Select unit\n2. Hover behind obstacle\n3. Preview path clips through wall\n\n## Acceptance Criteria\n- Path respects collision\n- Preview updates instantly\n- No flicker when moving cursor fast`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 2,
    },
    {
      title: 'Performance: reduce GC spikes during AI turns',
      description: `## Performance\nAI turn processing causes occasional hitches.\n\n## Acceptance Criteria\n- No GC spike > 2ms during AI sequence\n- Cache path results per turn\n- Fewer allocations in evaluation loop\n\n## Notes\nAdd profiler markers per AI phase.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -1,
    },
    {
      title: 'QA: tactical readability checklist',
      description: `## QA\nCheck combat readability for new players.\n\n## Checklist\n- Tile highlights\n- Damage preview\n- Status icons\n- Ability descriptions\n\n## Output\nShort doc in QA channel with screenshots.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 4,
    },
    {
      title: 'Add tutorial popups for cover system',
      description: `## Feature\nNew players struggle with cover. Add lightweight tutorial popups.\n\n## Acceptance Criteria\n- Trigger once per run\n- Dismissable\n- Shows visual example of cover bonus\n\n## Notes\nKeep copy under 200 characters.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -1,
    },
    {
      title: 'Art: new squad portrait frame set',
      description: `## Art\nAdd portrait frames for rarity tiers.\n\n## Deliverables\n- Common / Rare / Epic\n- Simple animation (glow pulse)\n- Export as spritesheet\n\n## Acceptance\nReadable at small sizes.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 10,
    },
    {
      title: 'Audio: ambient loop for "Sky Ruins" biome',
      description: `## Audio\nAdd a calm ambient bed for Sky Ruins maps.\n\n## Acceptance Criteria\n- Wind + distant chimes\n- No harsh high frequencies\n- Seamless loop\n\n## Notes\nKeep it subtle during turn transitions.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -5,
    },
    {
      title: 'Tools: export run recap JSON for debugging',
      description: `## Tools\nNeed a run recap file for balancing analysis.\n\n## Acceptance Criteria\n- Export to /Logs/RunRecaps\n- Includes squad, items, floor outcomes\n- Option to include RNG seed\n\n## Notes\nNo player identifiers.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 9,
    },
    {
      title: 'Bug: tooltip overlaps on ultra-wide resolutions',
      description: `## Bug\nAbility tooltips overlap the action bar on ultra-wide screens.\n\n## Acceptance Criteria\n- Tooltip anchors to safe area\n- Avoids off-screen placement\n- Works for 16:9 and 21:9\n\n## Notes\nTest with long ability names.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'Polish: add subtle hit shake + impact UI',
      description: `## Polish\nAdd subtle feedback when taking damage.\n\n## Acceptance Criteria\n- Tiny camera shake (toggleable)\n- Screen edge vignette (low intensity)\n- Does not reduce readability\n\n## Notes\nRespect accessibility settings.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 8,
    },
    {
      title: 'Design: perk pool cleanup (remove low-impact perks)',
      description: `## Balance\nSome perks are too weak and clutter the pool.\n\n## Acceptance Criteria\n- Remove 6 low-impact perks\n- Improve 4 situational perks\n- Update descriptions to be clearer\n\n## Notes\nKeep build variety high.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -9,
    },
    {
      title: 'QA: mobile performance sanity check (experimental build)',
      description: `## QA\nRun a quick performance sanity check on experimental build.\n\n## Checklist\n- Enter map\n- Start combat\n- Complete 2 floors\n- Record min/max FPS\n\n## Output\nPost results with device info.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -2,
    },
    {
      title: 'Add keyboard shortcuts for end-turn',
      description: `## UX\nAdd keyboard shortcuts for end turn and unit cycling.\n\n## Acceptance Criteria\n- Space: end turn\n- Tab: next unit\n- Shift+Tab: previous unit\n\n## Notes\nShow shortcuts in tooltip.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'done',
      isImportant: true,
      isUrgent: false,
      dueInDays: -1,
    },
  ],

  'neon-heist-online': [
    {
      title: 'Implement 4-player matchmaking v1',
      description: `## Online\nBasic matchmaking for 4-player co-op missions.\n\n## Acceptance Criteria\n- Match within 20s typical\n- Show "searching" UI state\n- Back out cleanly\n\n## Notes\nUse region preference if available.`,
      assignee: 'arif@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 8,
    },
    {
      title: 'Fix lobby ready-state desync',
      description: `## Bug\nSometimes one player sees "Ready" while others see "Not ready".\n\n## Acceptance Criteria\n- Ready state consistent across clients\n- Handles reconnect\n- No duplicate toasts\n\n## QA\nTest with 4 clients + packet loss simulation.`,
      assignee: 'arif@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 3,
    },
    {
      title: 'Gameplay: stealth takedown window tuning',
      description: `## Gameplay\nStealth takedown timing feels inconsistent.\n\n## Acceptance Criteria\n- Consistent prompt window\n- Clear audio cue when in range\n- Works while crouched and in cover\n\n## Notes\nAvoid accidental takedowns.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'UI: mission briefing card redesign',
      description: `## UI\nBriefing card needs clearer goals and rewards.\n\n## Acceptance Criteria\n- Goal list with icons\n- Difficulty tag\n- Reward preview strip\n\n## Notes\nKeep load time under 200ms.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 9,
    },
    {
      title: 'Art: neon signage pass for Alley District',
      description: `## Art\nAlley District needs stronger visual identity.\n\n## Deliverables\n- 10 neon sign variants\n- 3 animated flicker presets\n- LODs and light probes\n\n## Acceptance\nNo overbright bloom in low exposure.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -12,
    },
    {
      title: 'Audio: alarm escalation layers',
      description: `## Audio\nAdd escalating alarm layers based on alert level.\n\n## Acceptance Criteria\n- 3 layers: low/medium/high\n- Smooth crossfade\n- Works with stealth fail states\n\n## Notes\nKeep mix clean during firefights.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 12,
    },
    {
      title: 'Performance: reduce network bandwidth spikes',
      description: `## Performance\nBandwidth spikes during heavy combat.\n\n## Acceptance Criteria\n- Reduce peak outbound by 25%\n- No noticeable gameplay lag\n- Keep replication stable at 30Hz\n\n## Notes\nAudit projectile replication payload.`,
      assignee: 'arif@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -6,
    },
    {
      title: 'Bug: enemy AI occasionally stuck in patrol loop',
      description: `## Bug\nEnemy sometimes loops between two nodes forever.\n\n## Acceptance Criteria\n- Patrol progresses after 2 cycles\n- Detect blocked node and reroute\n- No CPU spike from re-pathing\n\n## QA\nRepro in Warehouse mission.`,
      assignee: 'tahmid@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 10,
    },
    {
      title: 'Add co-op ping wheel',
      description: `## Feature\nPlayers need quick callouts without voice.\n\n## Acceptance Criteria\n- 8 pings (go, wait, loot, danger, etc.)\n- Visible through walls within 20m\n- Rate limited to reduce spam\n\n## Notes\nController-friendly radial menu.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 7,
    },
    {
      title: 'Design: progression rewards for first 5 levels',
      description: `## Design\nEarly progression needs smoother rewards.\n\n## Acceptance Criteria\n- Level 1-5: unlock one meaningful item each\n- Avoid overpowered unlocks\n- Reward messaging fits UI\n\n## Notes\nKeep economy stable for co-op.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 11,
    },
    {
      title: 'QA: matchmaking smoke test checklist',
      description: `## QA\nRun smoke tests for matchmaking flow.\n\n## Checklist\n- Queue\n- Match found\n- Load mission\n- Complete and return to lobby\n\n## Output\nReport any hangs or state mismatches.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'arif@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 2,
    },
    {
      title: 'UI: teammate status panels (health + armor)',
      description: `## UI\nAdd compact teammate panels for co-op.\n\n## Acceptance Criteria\n- Show name + health/armor\n- Show downed state\n- Minimal screen space\n\n## Notes\nSupport 2-4 players.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -6,
    },
    {
      title: 'Bug: mission loading screen can hang at 95%',
      description: `## Bug\nOccasional hang while loading mission.\n\n## Acceptance Criteria\n- Add timeout + fallback retry\n- Log timings to analytics\n- Present clear error message\n\n## QA\nRepro using slow network profile.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: true,
      dueInDays: 4,
    },
    {
      title: 'Art: add props for warehouse stealth routes',
      description: `## Art\nWarehouse feels empty and offers little cover.\n\n## Deliverables\n- Pallets, crates, hanging tarps\n- 2 cover heights\n- Consistent collision volumes\n\n## Acceptance\nNo navmesh holes.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 13,
    },
    {
      title: 'Audio: footstep occlusion in vents',
      description: `## Audio\nVents should sound muffled and enclosed.\n\n## Acceptance Criteria\n- Apply low-pass filter\n- Reduce reverb tail\n- Transition smoothly entering/exiting\n\n## Notes\nTest with alarm state active.`,
      assignee: 'sadia@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -6,
    },
    {
      title: 'Tools: add server log aggregation for sessions',
      description: `## Tools\nNeed session-level logs to debug match issues.\n\n## Acceptance Criteria\n- Correlate logs by session ID\n- Basic search by player count and region\n- 7-day retention\n\n## Notes\nKeep sensitive data out.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'arif@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 14,
    },
    {
      title: 'Polish: mission success screen animation',
      description: `## Polish\nSuccess screen feels static and unexciting.\n\n## Acceptance Criteria\n- Quick highlight of loot gained\n- Team pose panel\n- Skip option\n\n## Notes\nKeep motion reduced option respected.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: false,
      isUrgent: false,
      dueInDays: 8,
    },
    {
      title: 'Design: stealth penalty tuning after alert',
      description: `## Balance\nAlerted enemies feel too punishing after one mistake.\n\n## Acceptance Criteria\n- Alert decays back to patrol over ~45s\n- Reduce accuracy bonus at medium alert\n- Keep high alert scary\n\n## Notes\nRe-test with new players.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -7,
    },
    {
      title: 'Add reconnect prompt on disconnect',
      description: `## UX\nWhen disconnected, show reconnect prompt instead of silent fail.\n\n## Acceptance Criteria\n- Clear message\n- Retry button\n- Return to menu fallback\n\n## Notes\nDo not spam toasts.`,
      assignee: 'arif@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'done',
      isImportant: true,
      isUrgent: false,
      dueInDays: -11,
    },
    {
      title: 'Always-on minimap for stealth missions',
      description: `## Experiment\nTried always-on minimap for stealth missions.\n\n## Result\nReduced tension and encouraged map-watching.\n\n## Decision\nKeep minimap only in "scanned" state.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'canceled',
      isImportant: false,
      isUrgent: false,
      dueInDays: 30,
    },
  ],

  'ci-cd': [
    {
      title: 'Stabilize nightly builds (Android + iOS)',
      description: `## CI/CD\nNightly builds are flaky and occasionally fail without clear cause.\n\n## Acceptance Criteria\n- Nightly runs at 2:00 AM\n- Retries only on known transient failures\n- Upload artifacts to internal channel\n\n## Notes\nAdd structured logs for failures.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: true,
      dueInDays: 4,
    },
    {
      title: 'Migrate legacy scripts to GitHub Actions',
      description: `## CI/CD\nMove remaining build scripts into GitHub Actions workflows.\n\n## Acceptance Criteria\n- Build matrix per platform\n- Cache dependencies\n- Clear job naming\n\n## Notes\nKeep secrets in OIDC/Vault path.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 8,
    },
    {
      title: 'Add artifact retention policy (7/30/90 days)',
      description: `## Ops\nArtifacts consume too much storage.\n\n## Acceptance Criteria\n- PR builds retained 7 days\n- Nightly retained 30 days\n- Release retained 90 days\n\n## Notes\nDocument the policy in wiki.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'Build notifications into Engineering chat',
      description: `## Automation\nNotify Engineering when build status changes.\n\n## Acceptance Criteria\n- Post on fail + recovery\n- Include link to logs\n- Include commit author\n\n## Notes\nAvoid notification spam.`,
      assignee: 'arif@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 5,
    },
    {
      title: 'Fix flaky test timeout in CI',
      description: `## Bug\nA few tests intermittently timeout in CI only.\n\n## Acceptance Criteria\n- Increase timeout to safe value\n- Add logs for slowest steps\n- Keep local runtime unchanged\n\n## Notes\nThis is a mitigation, not a full fix.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'done',
      isImportant: true,
      isUrgent: true,
      dueInDays: -4,
    },
    {
      title: 'Add build metadata manifest to artifacts',
      description: `## CI/CD\nWe need build metadata attached to every artifact.\n\n## Acceptance Criteria\n- JSON file with commit, branch, time, version\n- Included in all platform bundles\n- Visible in internal download UI\n\n## Notes\nNo secrets inside manifest.`,
      assignee: 'arif@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 9,
    },
    {
      title: 'Runner health dashboard (basic)',
      description: `## Monitoring\nRunners fail silently too often.\n\n## Acceptance Criteria\n- Show online/offline runners\n- Last job time\n- Disk space warning thresholds\n\n## Notes\nStart with a simple JSON endpoint + table UI.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -1,
    },
    {
      title: 'Speed up Unity builds with Library caching',
      description: `## Performance\nUnity builds are slower than expected on clean runners.\n\n## Acceptance Criteria\n- Cache Unity Library folder safely\n- Build time reduced by 20%\n- Cache invalidation documented\n\n## Notes\nVerify cache does not introduce build bugs.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 10,
    },
    {
      title: 'QA: verify release candidate packaging checklist',
      description: `## QA\nEnsure RC builds are packaged correctly.\n\n## Checklist\n- Version string correct\n- Debug symbols uploaded\n- Crash reporting enabled\n- No dev-only UI\n\n## Output\nSign off in Build & Releases channel.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 3,
    },
    {
      title: 'Add release tagging automation',
      description: `## Automation\nRelease tags should be created consistently.\n\n## Acceptance Criteria\n- Tag format: vMAJOR.MINOR.PATCH\n- Tag created after successful RC build\n- Changelog link included\n\n## Notes\nManual override allowed for hotfix.`,
      assignee: 'arif@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -9,
    },
    {
      title: 'Build logs: redact secrets from output',
      description: `## Security\nEnsure logs do not leak credentials or tokens.\n\n## Acceptance Criteria\n- Redact known patterns\n- Sanitize env dumps\n- Verify artifacts contain no secrets\n\n## Notes\nAdd unit tests for redaction.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 11,
    },
    {
      title: 'Improve failure summaries for common errors',
      description: `## UX (CI)\nFailures are hard to understand quickly.\n\n## Acceptance Criteria\n- Parse common errors (disk full, signing, timeout)\n- Show 1-line summary in message\n- Link to full logs\n\n## Notes\nKeep it simple and reliable.`,
      assignee: 'arif@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -7,
    },
    {
      title: 'Docs: onboarding for build pipeline',
      description: `## Docs\nNew engineers struggle to understand pipeline steps.\n\n## Acceptance Criteria\n- Single wiki page walkthrough\n- Where artifacts live\n- How to re-run failed jobs\n\n## Notes\nInclude screenshots of the dashboard.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: false,
      dueInDays: 9,
    },
    {
      title: 'Add Sentry upload step for symbol files',
      description: `## Crash Reporting\nSymbols should be uploaded for meaningful stacks.\n\n## Acceptance Criteria\n- Upload symbols on RC + release\n- Validate upload success\n- Store upload report in artifacts\n\n## Notes\nDo not upload on PR builds.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'arif@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 7,
    },
    {
      title: 'Bug: iOS signing occasionally fails on mac runners',
      description: `## Bug\nSigning fails randomly with keychain errors.\n\n## Acceptance Criteria\n- Ensure keychain unlocked per job\n- Retry once on known transient failure\n- Logs include clear reason\n\n## QA\nRun 5 builds back-to-back.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'arif@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 2,
    },
    {
      title: 'Performance: reduce checkout time for large repos',
      description: `## Performance\nCheckout step is slow for assets-heavy repos.\n\n## Acceptance Criteria\n- Shallow clone where safe\n- LFS tuned\n- Checkout time reduced by 30%\n\n## Notes\nVerify build reproducibility.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'tahmid@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -3,
    },
    {
      title: 'Add manual “Promote to RC” workflow dispatch',
      description: `## Feature\nAllow manual promotion to release candidate from main branch.\n\n## Acceptance Criteria\n- Requires approver\n- Creates RC artifact set\n- Posts notification on completion\n\n## Notes\nUse environment protection rules.`,
      assignee: 'arif@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -6,
    },
    {
      title: 'QA: verify build notifications do not spam',
      description: `## QA\nCheck notification behavior for flakey builds.\n\n## Acceptance Criteria\n- One post per state change\n- Group repeated failures\n- Mentions correct on-call role\n\n## Output\nShort checklist in Engineering channel.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'farhan@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -2,
    },
    {
      title: 'Push all artifacts to public CDN',
      description: `## Idea\nConsidered pushing artifacts to public CDN for speed.\n\n## Result\nNot needed and raises security/compliance risks.\n\n## Decision\nKeep artifacts internal only.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'canceled',
      isImportant: false,
      isUrgent: false,
      dueInDays: 30,
    },
  ],

  'internal-tools': [
    {
      title: 'Add role-based permissions (admin/editor/viewer)',
      description: `## Internal tools\nPermissions are currently too open.\n\n## Acceptance Criteria\n- Roles: admin/editor/viewer\n- Project-level permission assignment\n- UI hides restricted actions\n\n## Notes\nKeep the model simple and auditable.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 10,
    },
    {
      title: 'Tasks: add due date quick filter (Today/This week)',
      description: `## UX\nUsers want faster filtering for due dates.\n\n## Acceptance Criteria\n- Filters: Today, This week, Overdue\n- Works with search query\n- Fast (no noticeable lag)\n\n## Notes\nEnsure timezone correctness.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 7,
    },
    {
      title: 'Wiki: markdown editor toolbar',
      description: `## Feature\nAdd lightweight toolbar for common markdown formatting.\n\n## Acceptance Criteria\n- Bold/Italic/Code/Link\n- Headings\n- Bulleted lists\n\n## Notes\nKeyboard shortcuts supported where possible.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 6,
    },
    {
      title: 'Bug: message list scroll jumps on new messages',
      description: `## Bug\nWhen a new message arrives, the scroll sometimes jumps.\n\n## Acceptance Criteria\n- Stable scroll when user is reading old messages\n- Auto-scroll only if near bottom\n- No layout shift on image loads\n\n## Notes\nTest with long message threads.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 3,
    },
    {
      title: 'Performance: speed up task list load for large projects',
      description: `## Performance\nTask list slows down when there are many tasks.\n\n## Acceptance Criteria\n- First render under 300ms on 200 tasks\n- Pagination or virtualization\n- Keep search responsive\n\n## Notes\nAdd basic perf metrics in dev console.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -8,
    },
    {
      title: 'Add emoji reactions to chat messages',
      description: `## Feature\nReactions make chat more useful and fun.\n\n## Acceptance Criteria\n- 6 default emojis\n- Add/remove reaction\n- Reaction counts visible\n\n## Notes\nPrevent reaction spam with simple rate limit.`,
      assignee: 'arif@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: false,
      isUrgent: false,
      dueInDays: 9,
    },
    {
      title: 'UI: project switcher search + recent list',
      description: `## UX\nProject switcher should be fast with keyboard.\n\n## Acceptance Criteria\n- Search by name\n- Recent projects pinned\n- Clear selected indicator\n\n## Notes\nKeep it accessible and screen-reader friendly.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 8,
    },
    {
      title: 'Audit log for admin actions (basic)',
      description: `## Monitoring\nTrack admin actions for safety and debugging.\n\n## Acceptance Criteria\n- Log: user, action, time\n- Actions: role change, delete, edit wiki\n- Read-only audit page\n\n## Notes\nDo not log sensitive message bodies.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -5,
    },
    {
      title: 'Bug: wiki search misses results with punctuation',
      description: `## Bug\nSearch fails when query includes punctuation or dashes.\n\n## Acceptance Criteria\n- Normalize punctuation\n- Match hyphenated words\n- Return stable results\n\n## Notes\nAdd a few unit tests for tokenization.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: false,
      isUrgent: true,
      dueInDays: 4,
    },
    {
      title: 'Add “Assigned to me” home dashboard widget',
      description: `## Feature\nUsers want a quick view of personal tasks.\n\n## Acceptance Criteria\n- Shows 5 most urgent tasks\n- Click-through to full list\n- Empty state guidance\n\n## Notes\nRespect project permissions.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'in-progress',
      isImportant: true,
      isUrgent: false,
      dueInDays: 5,
    },
    {
      title: 'QA: verify chat message ordering with latency',
      description: `## QA\nValidate message order under simulated latency.\n\n## Checklist\n- Send 20 messages quickly\n- Refresh tab\n- Ensure order stable\n\n## Output\nNote any duplicates or missing messages.`,
      assignee: 'rafiq@zurat.dev',
      reporter: 'arif@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: true,
      dueInDays: 2,
    },
    {
      title: 'Docs: internal tools usage guide (short)',
      description: `## Docs\nCreate a short usage guide for new hires.\n\n## Acceptance Criteria\n- How to join projects\n- How to create tasks\n- How to edit wiki\n\n## Notes\nKeep it under one page.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -5,
    },
    {
      title: 'Add mention suggestions (@name) in chat',
      description: `## Feature\nMentions should autocomplete as users type.\n\n## Acceptance Criteria\n- @ triggers suggestion list\n- Filter by name\n- Insert formatted mention\n\n## Notes\nKeep list sorted by recent interactions.`,
      assignee: 'arif@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -3,
    },
    {
      title: 'Bug: task markdown preview breaks on long code blocks',
      description: `## Bug\nLong code blocks overflow and break layout.\n\n## Acceptance Criteria\n- Code blocks scroll horizontally\n- No layout overflow\n- Works in dark mode\n\n## Notes\nAdd CSS for pre/code wrapping.`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'rafiq@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 7,
    },
    {
      title: 'Add org settings page (name + slug view)',
      description: `## Feature\nBasic org settings view for admins.\n\n## Acceptance Criteria\n- Show org name + slug\n- List members count\n- Admin-only access\n\n## Notes\nEdit actions can come later.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'backlog',
      isImportant: false,
      isUrgent: false,
      dueInDays: -14,
    },
    {
      title: 'Performance: optimize wiki page render for large docs',
      description: `## Performance\nLarge wiki pages render slowly.\n\n## Acceptance Criteria\n- Render under 200ms for 2000 lines\n- Lazy-render headings\n- Smooth scroll\n\n## Notes\nAvoid heavy syntax highlighting by default.`,
      assignee: 'farhan@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'backlog',
      isImportant: true,
      isUrgent: false,
      dueInDays: -4,
    },
    {
      title: 'Add simple project member invite flow',
      description: `## Feature\nAllow adding members to a project from UI.\n\n## Acceptance Criteria\n- Search users by name/email\n- Add member and confirm\n- Respect role permissions\n\n## Notes\nNo external invites (internal only).`,
      assignee: 'mehnaz@zurat.dev',
      reporter: 'nabila@zurat.dev',
      status: 'done',
      isImportant: true,
      isUrgent: false,
      dueInDays: -7,
    },
    {
      title: 'Auto-archive inactive chats after 30 days',
      description: `## Idea\nAuto-archiving chats sounded tidy.\n\n## Result\nTeams prefer keeping context discoverable.\n\n## Decision\nKeep manual archive only.`,
      assignee: 'nabila@zurat.dev',
      reporter: 'nusrat@zurat.dev',
      status: 'canceled',
      isImportant: false,
      isUrgent: false,
      dueInDays: 30,
    },
    {
      title: 'Add file attachment support for wiki (images only)',
      description: `## Feature\nAllow images in wiki pages for diagrams.\n\n## Acceptance Criteria\n- Upload PNG/JPG\n- Insert into markdown\n- Basic size limits\n\n## Notes\nNo PDFs for now.`,
      assignee: 'arif@zurat.dev',
      reporter: 'mehnaz@zurat.dev',
      status: 'todo',
      isImportant: true,
      isUrgent: false,
      dueInDays: 12,
    },
  ],
};

interface WikiDef {
  title: string;
  content: string;
  daysAgo: number;
}

// Expanded WIKI per project (3-5 pages each)
const WIKI: Record<string, WikiDef[]> = {
  'ashen-frontier': [
    {
      title: 'Combat Overview',
      daysAgo: 6,
      content: `# Combat Overview\n\n## Pillars\n- **Responsive stamina** (tactical pacing)\n- **Readable hits** (clear telegraphs)\n- **Build expression** (weapons + spells)\n\n## Core Actions\n- Light / Heavy combos\n- Dodge roll (i-frames)\n- Block + guard meter\n\n## Notes\nCombat should feel tough but fair, with strong audio-visual feedback.`,
    },
    {
      title: 'Art Direction Notes',
      daysAgo: 18,
      content: `# Art Direction Notes\n\n## Look\nStylized realism: painterly textures with grounded lighting.\n\n## Palette\n- Warm oranges for safe zones\n- Cold blues for ruins\n- Desaturated tones for corrupted areas\n\n## Environment\nUse layered silhouettes and fog for depth.`,
    },
    {
      title: 'Boss Encounter Guidelines',
      daysAgo: 11,
      content: `# Boss Encounter Guidelines\n\n## Rules\n- Telegraph big attacks clearly\n- Provide windows for stamina recovery\n- Add 2-3 learnable patterns\n\n## Arena\n- Avoid tight corners\n- Include landmarks for orientation\n- Space for dodge + camera movement`,
    },
    {
      title: 'QA Smoke Checklist',
      daysAgo: 4,
      content: `# QA Smoke Checklist\n\n## Must Pass\n- Load into town\n- Combat vs 3 enemies\n- Inventory open/close\n- Save + reload\n\n## Report\nNote any crashes, camera issues, or major visual bugs.`,
    },
  ],

  'drift-district': [
    {
      title: 'Track Design Guidelines',
      daysAgo: 7,
      content: `# Track Design Guidelines\n\n## Layout\n- 3 laps, 60-90 seconds per lap\n- At least 2 shortcut routes\n- Avoid long straights (>5 seconds)\n\n## Clarity\n- Racing line is obvious\n- Hazards telegraphed\n- Boost pads glow pre-activation`,
    },
    {
      title: 'Mobile Performance Targets',
      daysAgo: 9,
      content: `# Mobile Performance Targets\n\n## Targets\n- 60 FPS on mid-range devices\n- 30 FPS fallback mode\n\n## Budgets\n- Particles capped\n- Shadows scalable\n- Reflection quality depends on mode\n\n## Notes\nAlways test worst-case: rain + boosts + 8 racers.`,
    },
    {
      title: 'Live Events Plan',
      daysAgo: 12,
      content: `# Live Events Plan\n\n## Weekly\n- 2 limited challenges\n- Track rotation\n\n## Seasonal\n- New track + cosmetics\n- One premium bundle\n\n## Principle\nNo pay-to-win. Cosmetics only.`,
    },
    {
      title: 'Community Feedback Summary',
      daysAgo: 3,
      content: `# Community Feedback Summary\n\n## Positive\n- Fun drift feeling\n- Short races\n- Cute cosmetics\n\n## Issues\n- Drift too sensitive on touch\n- Guardrail clip bug\n- Some FPS dips in rain\n\n## Next\nPrioritize controls + stability.`,
    },
  ],

  'skybound-tactics': [
    {
      title: 'Combat Readability Goals',
      daysAgo: 5,
      content: `# Combat Readability Goals\n\n## Must Be Obvious\n- Move range\n- Attack tiles\n- Damage preview\n- Status effects\n\n## UI Notes\nPrioritize clarity over style. Keep tooltips short.`,
    },
    {
      title: 'Perk Design Rules',
      daysAgo: 16,
      content: `# Perk Design Rules\n\n## Rules\n- Avoid tiny numerical perks\n- Encourage different playstyles\n- Keep descriptions crisp\n\n## Example\n"After moving, gain +1 range for the next attack."`,
    },
    {
      title: 'Biome Set: Sky Ruins',
      daysAgo: 10,
      content: `# Biome Set: Sky Ruins\n\n## Mood\nFloating stone, calm wind, soft light.\n\n## Landmarks\n- Broken arches\n- Hanging bridges\n- Ancient glyph panels\n\n## Notes\nKeep navigation clear for grid gameplay.`,
    },
    {
      title: 'QA Test Cases (Turn Loop)',
      daysAgo: 6,
      content: `# QA Test Cases (Turn Loop)\n\n## Basics\n- Start combat\n- Move + attack\n- End turn\n- Enemy acts\n\n## Edge Cases\n- Skip animation\n- Undo move (if enabled)\n- Tooltip spam\n\n## Report\nAny stuck states or UI overlaps.`,
    },
  ],

  'neon-heist-online': [
    {
      title: 'Co-op Mission Pillars',
      daysAgo: 8,
      content: `# Co-op Mission Pillars\n\n## Pillars\n- Stealth first, combat as fallback\n- Team coordination\n- Fast recovery from mistakes\n\n## Mission Flow\nBriefing → Infiltration → Objective → Extraction`,
    },
    {
      title: 'Network Sync Expectations',
      daysAgo: 14,
      content: `# Network Sync Expectations\n\n## Goals\n- Stable state replication\n- Predictable movement\n- Clear error messaging on disconnect\n\n## Notes\nPrioritize consistency over perfect precision.`,
    },
    {
      title: 'Art Notes: Neon Alley District',
      daysAgo: 21,
      content: `# Art Notes: Neon Alley District\n\n## Style\nWet asphalt, strong reflections, bold signage.\n\n## Lighting\n- Strong rim lights\n- Controlled bloom\n- Fog for depth\n\n## Notes\nKeep signage readable, not noisy.`,
    },
    {
      title: 'QA Checklist (Matchmaking)',
      daysAgo: 4,
      content: `# QA Checklist (Matchmaking)\n\n## Must Pass\n- Queue into match\n- Cancel queue\n- Load mission\n- Complete and return to lobby\n\n## Notes\nTest with slow network profile as well.`,
    },
  ],

  'ci-cd': [
    {
      title: 'Build Pipeline Overview',
      daysAgo: 5,
      content: `# Build Pipeline Overview\n\n## Stages\n1. Checkout\n2. Restore cache\n3. Build\n4. Run tests\n5. Package artifacts\n6. Upload + notify\n\n## Notes\nNightly builds should be reliable and predictable.`,
    },
    {
      title: 'Release Candidate Checklist',
      daysAgo: 9,
      content: `# Release Candidate Checklist\n\n## Required\n- Version string\n- Crash reporting enabled\n- Debug symbols uploaded\n- No dev flags\n\n## Output\nArtifact set + manifest JSON.`,
    },
    {
      title: 'Runner Maintenance Notes',
      daysAgo: 20,
      content: `# Runner Maintenance Notes\n\n## Weekly\n- Disk cleanup\n- Update toolchains\n- Verify certificates\n\n## Alerts\n- Offline > 10 min\n- Disk < 10%\n\n## Notes\nPrefer small, frequent maintenance.`,
    },
  ],

  'internal-tools': [
    {
      title: 'Permissions Model',
      daysAgo: 6,
      content: `# Permissions Model\n\n## Roles\n- Admin\n- Editor\n- Viewer\n\n## Rules\n- Roles are project-scoped\n- Viewers can read but not write\n- Admins can manage members\n\n## Notes\nKeep it simple and auditable.`,
    },
    {
      title: 'Task Markdown Conventions',
      daysAgo: 8,
      content: `# Task Markdown Conventions\n\n## Recommended Sections\n- Goal\n- Acceptance Criteria\n- Steps to Reproduce (bugs)\n- Notes\n\n## Example\nUse bullet points for criteria so QA can check quickly.`,
    },
    {
      title: 'Search & Indexing Notes',
      daysAgo: 15,
      content: `# Search & Indexing Notes\n\n## Principles\n- Fast typeahead\n- Normalize punctuation\n- Stable sorting\n\n## Notes\nPrefer relevance first, then recency.`,
    },
    {
      title: 'Onboarding',
      daysAgo: 30,
      content: `# Onboarding\n\n## First Steps\n1. Join your project\n2. Check your assigned tasks\n3. Read project wiki\n4. Say hi in General\n\n## Tip\nUse Studio AI for summaries and drafting.`,
    },
  ],
};

interface ChatGroupDef {
  name: string;
  type: 'group' | 'ai';
  members: string[] | 'all';
}

const CHAT_GROUPS: ChatGroupDef[] = [
  { name: 'General', type: 'group', members: 'all' },
  {
    name: 'Engineering',
    type: 'group',
    members: ['tahmid@zurat.dev', 'farhan@zurat.dev', 'arif@zurat.dev'],
  },
  {
    name: 'Art & Design',
    type: 'group',
    members: ['nabila@zurat.dev', 'mehnaz@zurat.dev', 'sadia@zurat.dev', 'tahmid@zurat.dev'],
  },
  {
    name: 'QA / Playtests',
    type: 'group',
    members: ['rafiq@zurat.dev', 'nabila@zurat.dev', 'tahmid@zurat.dev', 'mehnaz@zurat.dev', 'arif@zurat.dev'],
  },
  {
    name: 'Build & Releases',
    type: 'group',
    members: ['farhan@zurat.dev', 'rafiq@zurat.dev', 'arif@zurat.dev', 'tahmid@zurat.dev'],
  },
  { name: 'Studio AI', type: 'ai', members: 'all' },
];

// Each user appears in ~2-3 DM pairs (here everyone appears exactly 3 times)
const DM_PAIRS: [string, string][] = [
  ['nabila@zurat.dev', 'tahmid@zurat.dev'],
  ['nabila@zurat.dev', 'farhan@zurat.dev'],
  ['nabila@zurat.dev', 'nusrat@zurat.dev'],

  ['tahmid@zurat.dev', 'arif@zurat.dev'],
  ['tahmid@zurat.dev', 'mehnaz@zurat.dev'],

  ['farhan@zurat.dev', 'rafiq@zurat.dev'],
  ['farhan@zurat.dev', 'sadia@zurat.dev'],

  ['mehnaz@zurat.dev', 'sadia@zurat.dev'],
  ['mehnaz@zurat.dev', 'rafiq@zurat.dev'],

  ['rafiq@zurat.dev', 'arif@zurat.dev'],

  ['sadia@zurat.dev', 'nusrat@zurat.dev'],
  ['arif@zurat.dev', 'nusrat@zurat.dev'],
];

interface MessageDef {
  from: string;
  body: string;
  minutesAgo: number;
}

const MESSAGES: Record<string, MessageDef[]> = {
  General: [
    { from: 'nabila@zurat.dev', body: 'Morning! Quick sync: build review at 10:30.', minutesAgo: 190 },
    { from: 'farhan@zurat.dev', body: 'FYI runners will reboot around 2pm for updates.', minutesAgo: 160 },
    {
      from: 'nusrat@zurat.dev',
      body: 'Drift District ratings climbed to 4.3 ⭐ after the last patch 👀',
      minutesAgo: 120,
    },
    { from: 'rafiq@zurat.dev', body: 'Nice! Any new top complaints coming in?', minutesAgo: 115 },
    {
      from: 'nusrat@zurat.dev',
      body: 'Mostly drift sensitivity + that guardrail clip. I’m replying to players and collecting clips.',
      minutesAgo: 110,
    },
    { from: 'tahmid@zurat.dev', body: 'I can take drift tuning today. Share the clips when you can.', minutesAgo: 105 },
    {
      from: 'sadia@zurat.dev',
      body: 'Pushed a new spark VFX for Drift District. Looks much cleaner now.',
      minutesAgo: 65,
    },
    { from: 'mehnaz@zurat.dev', body: 'Love it — I’ll align the UI feedback with it.', minutesAgo: 60 },
  ],

  Engineering: [
    { from: 'farhan@zurat.dev', body: 'CI status: nightly failed due to iOS signing again.', minutesAgo: 210 },
    { from: 'arif@zurat.dev', body: 'Was it keychain locked? Same error as last week?', minutesAgo: 205 },
    { from: 'farhan@zurat.dev', body: 'Yep. I added unlock step but it still flakes sometimes.', minutesAgo: 200 },
    { from: 'tahmid@zurat.dev', body: 'Can we add a single retry on that specific signing error?', minutesAgo: 195 },
    { from: 'farhan@zurat.dev', body: 'Good call. I’ll implement a guarded retry + better logs.', minutesAgo: 190 },
    {
      from: 'arif@zurat.dev',
      body: 'Also seeing bandwidth spikes in Neon Heist tests. I’ll profile payload sizes.',
      minutesAgo: 160,
    },
  ],

  'Art & Design': [
    {
      from: 'nabila@zurat.dev',
      body: 'Ashen Frontier Chapter 3 arena: thinking lava + warm oranges. Too similar to Fire Bolt effects?',
      minutesAgo: 130,
    },
    {
      from: 'sadia@zurat.dev',
      body: 'If the lava is warm, we can push Fire Bolt into hotter whites + smoke trails.',
      minutesAgo: 125,
    },
    {
      from: 'mehnaz@zurat.dev',
      body: 'UI can use cooler highlights so the HUD doesn’t get lost in the warm arena.',
      minutesAgo: 120,
    },
    {
      from: 'tahmid@zurat.dev',
      body: 'Gameplay-wise: please leave a few safe corners for stamina recovery windows.',
      minutesAgo: 115,
    },
    {
      from: 'nabila@zurat.dev',
      body: 'Perfect. I’ll block out a layout and share screenshots later today.',
      minutesAgo: 110,
    },
  ],

  'QA / Playtests': [
    {
      from: 'rafiq@zurat.dev',
      body: 'Playtest note: dodge roll blend snap still happening when sprinting.',
      minutesAgo: 155,
    },
    { from: 'sadia@zurat.dev', body: 'Got it. I’ll adjust the blend tree and retest the transition.', minutesAgo: 150 },
    {
      from: 'rafiq@zurat.dev',
      body: 'Also Drift District guardrail clip is very reproducible on Curve 3.',
      minutesAgo: 145,
    },
    {
      from: 'tahmid@zurat.dev',
      body: 'I’ll check the collision thickness + high speed contact points.',
      minutesAgo: 140,
    },
    { from: 'mehnaz@zurat.dev', body: 'Any screenshots of UI overlap on ultra-wide in Skybound?', minutesAgo: 135 },
    { from: 'rafiq@zurat.dev', body: 'Yep, will post screenshots in a thread.', minutesAgo: 130 },
  ],

  'Build & Releases': [
    { from: 'farhan@zurat.dev', body: 'Nightly is red. iOS signing error in job: ios-build.', minutesAgo: 220 },
    { from: 'rafiq@zurat.dev', body: 'Can you post the last 20 lines of the signing log?', minutesAgo: 215 },
    { from: 'farhan@zurat.dev', body: 'Posted. Looks like keychain access denied.', minutesAgo: 210 },
    {
      from: 'arif@zurat.dev',
      body: 'I’ll patch the workflow with explicit unlock + verify identity step.',
      minutesAgo: 205,
    },
    { from: 'farhan@zurat.dev', body: 'Thanks. Once it’s green, I’ll re-run the full matrix.', minutesAgo: 200 },
  ],

  'Studio AI': [
    { from: 'nabila@zurat.dev', body: 'Summarize the Combat Overview wiki page.', minutesAgo: 300 },
    { from: 'mehnaz@zurat.dev', body: 'Draft a UI checklist for the new project switcher.', minutesAgo: 240 },
    {
      from: 'nusrat@zurat.dev',
      body: 'Write a short community update about drift sensitivity fixes.',
      minutesAgo: 180,
    },
  ],

  // DM keys are based on sorted local-part names: [a,b].sort().join('-')

  'nabila-tahmid': [
    {
      from: 'nabila@zurat.dev',
      body: 'Hey — can you prioritize stamina tuning for Ashen Frontier this week?',
      minutesAgo: 70,
    },
    {
      from: 'tahmid@zurat.dev',
      body: 'Yep. I’ll adjust drain/regen and push a build for QA tomorrow.',
      minutesAgo: 65,
    },
    {
      from: 'nabila@zurat.dev',
      body: 'Awesome. Keep dodge cost at 25 for now, just tweak regen feel.',
      minutesAgo: 62,
    },
    {
      from: 'tahmid@zurat.dev',
      body: 'Got it. I’ll also add a small UI pulse when stamina is too low.',
      minutesAgo: 55,
    },
    { from: 'nabila@zurat.dev', body: 'Nice touch. Thanks!', minutesAgo: 50 },
  ],

  'farhan-nabila': [
    { from: 'farhan@zurat.dev', body: 'CI/CD question: should RC artifacts keep 90-day retention?', minutesAgo: 95 },
    {
      from: 'nabila@zurat.dev',
      body: 'Yes, RC and release should stay longer. PR builds can be short.',
      minutesAgo: 92,
    },
    { from: 'farhan@zurat.dev', body: 'Cool. I’ll set PR=7d, nightly=30d, RC=90d.', minutesAgo: 88 },
    { from: 'nabila@zurat.dev', body: 'Perfect. Add it to the build wiki too.', minutesAgo: 84 },
  ],

  'nabila-nusrat': [
    { from: 'nusrat@zurat.dev', body: 'Guardrail clip bug is getting a lot of reports 😬', minutesAgo: 78 },
    {
      from: 'nabila@zurat.dev',
      body: 'Yeah, we need it fixed fast. Can you gather 2-3 clips for the team?',
      minutesAgo: 75,
    },
    { from: 'nusrat@zurat.dev', body: 'On it. Also drift sensitivity is #2 complaint.', minutesAgo: 72 },
    {
      from: 'nabila@zurat.dev',
      body: 'We’ll push a tuning patch + clear notes. Keep comms friendly and short.',
      minutesAgo: 69,
    },
  ],

  'arif-tahmid': [
    {
      from: 'arif@zurat.dev',
      body: 'Neon Heist matchmaking v1: can you sanity-check the lobby states?',
      minutesAgo: 120,
    },
    { from: 'tahmid@zurat.dev', body: 'Sure. I’ll test ready/unready and mission start edge cases.', minutesAgo: 116 },
    { from: 'arif@zurat.dev', body: 'If you see desync, grab logs with timestamps.', minutesAgo: 112 },
    {
      from: 'tahmid@zurat.dev',
      body: 'Will do. Also adding a small ready-state animation helps clarity.',
      minutesAgo: 108,
    },
  ],

  'mehnaz-tahmid': [
    {
      from: 'mehnaz@zurat.dev',
      body: 'Quick question: stamina UI should always be visible or only in combat?',
      minutesAgo: 85,
    },
    { from: 'tahmid@zurat.dev', body: 'Prefer always visible but subdued out of combat.', minutesAgo: 82 },
    { from: 'mehnaz@zurat.dev', body: 'Nice. I’ll do low opacity + fade-in on stamina spend.', minutesAgo: 79 },
    { from: 'tahmid@zurat.dev', body: 'Perfect. That’ll help players understand drain/regen quickly.', minutesAgo: 75 },
  ],

  'farhan-rafiq': [
    {
      from: 'rafiq@zurat.dev',
      body: 'Nightly fails are back. Want me to run a quick RC checklist anyway?',
      minutesAgo: 140,
    },
    { from: 'farhan@zurat.dev', body: 'Yes please. Even partial checklist is helpful.', minutesAgo: 136 },
    {
      from: 'rafiq@zurat.dev',
      body: 'Ok. I’ll verify version strings and crash reporting in the last green build.',
      minutesAgo: 132,
    },
    {
      from: 'farhan@zurat.dev',
      body: 'Thanks. Posting a quick summary in Build & Releases will be great.',
      minutesAgo: 129,
    },
  ],

  'farhan-sadia': [
    {
      from: 'farhan@zurat.dev',
      body: 'Your drift sparks look great — any performance concerns on low-end?',
      minutesAgo: 155,
    },
    {
      from: 'sadia@zurat.dev',
      body: 'I kept particles low and added a cheap fallback in low graphics mode.',
      minutesAgo: 151,
    },
    {
      from: 'farhan@zurat.dev',
      body: 'Awesome. If you have time, can you add a toggle for heat shimmer too?',
      minutesAgo: 148,
    },
    { from: 'sadia@zurat.dev', body: 'Yep, I’ll hook it to the settings menu.', minutesAgo: 145 },
  ],

  'mehnaz-sadia': [
    {
      from: 'mehnaz@zurat.dev',
      body: 'Can you share the VFX naming convention? I’m aligning UI assets.',
      minutesAgo: 100,
    },
    { from: 'sadia@zurat.dev', body: 'Sure: VFX_<Project>_<Feature>_<Variant>. I’ll drop examples.', minutesAgo: 98 },
    { from: 'mehnaz@zurat.dev', body: 'Perfect. Makes it way easier for the preview cards.', minutesAgo: 94 },
  ],

  'mehnaz-rafiq': [
    { from: 'rafiq@zurat.dev', body: 'UI note: tooltips overlap on ultra-wide in Skybound.', minutesAgo: 110 },
    { from: 'mehnaz@zurat.dev', body: 'Thanks! Can you screenshot with a long ability name?', minutesAgo: 108 },
    { from: 'rafiq@zurat.dev', body: 'Yep. Sending in a bit after my run.', minutesAgo: 105 },
    { from: 'mehnaz@zurat.dev', body: 'Great. I’ll anchor tooltips to the safe area.', minutesAgo: 102 },
  ],

  'arif-rafiq': [
    { from: 'arif@zurat.dev', body: 'Can you run a matchmaking smoke test later today?', minutesAgo: 90 },
    { from: 'rafiq@zurat.dev', body: 'Yep. I’ll do 4 clients and try packet loss too.', minutesAgo: 87 },
    {
      from: 'arif@zurat.dev',
      body: 'Nice. If the lobby ready-state desync happens, note exact times.',
      minutesAgo: 84,
    },
  ],

  'nusrat-sadia': [
    {
      from: 'nusrat@zurat.dev',
      body: 'The new drift sparks look 🔥. Can we get a short clip for socials?',
      minutesAgo: 125,
    },
    { from: 'sadia@zurat.dev', body: 'Absolutely. I’ll record a 10s clip with the three tiers.', minutesAgo: 122 },
    { from: 'nusrat@zurat.dev', body: 'Perfect. I’ll caption it as "Better drift feedback".', minutesAgo: 118 },
  ],

  'arif-nusrat': [
    { from: 'nusrat@zurat.dev', body: 'Players ask about region matchmaking. Any update?', minutesAgo: 135 },
    { from: 'arif@zurat.dev', body: 'We can add a "Prefer Nearby" toggle with a global fallback.', minutesAgo: 132 },
    { from: 'nusrat@zurat.dev', body: 'Nice. That’s a good community talking point.', minutesAgo: 128 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type TableName = keyof DataModel;

async function clearTable(ctx: { db: any }, table: TableName) {
  const docs = await ctx.db.query(table).collect();
  for (const doc of docs) {
    await ctx.db.delete(doc._id);
  }
}

function avatar(email: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${email}`;
}

function minutesAgo(n: number) {
  return Date.now() - n * 60 * 1000;
}

function daysAgo(n: number) {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

function daysFromNow(n: number) {
  return Date.now() + n * 24 * 60 * 60 * 1000;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED MUTATION
// ─────────────────────────────────────────────────────────────────────────────

export const run = mutation({
  args: {
    wipe: v.optional(v.boolean()),
  },
  handler: async (ctx, { wipe = false }) => {
    // Wipe all tables if requested
    if (wipe) {
      await clearTable(ctx, 'messages');
      await clearTable(ctx, 'chatParticipants');
      await clearTable(ctx, 'chats');
      await clearTable(ctx, 'wiki');
      await clearTable(ctx, 'tasks');
      await clearTable(ctx, 'projectMembers');
      await clearTable(ctx, 'projects');
      await clearTable(ctx, 'orgs');
      await clearTable(ctx, 'users');
    }

    // Skip if already seeded
    const hasAnyUser = await ctx.db.query('users').first();
    if (hasAnyUser && !wipe) {
      return { ok: true as const, skipped: true, reason: 'Already seeded (pass wipe:true)' };
    }

    // ── ORG ──────────────────────────────────────────────────────────────────
    const existingOrg = await ctx.db
      .query('orgs')
      .withIndex('by_slug', (q: any) => q.eq('slug', ORG.slug))
      .first();

    const orgID: Id<'orgs'> = existingOrg?._id ?? (await ctx.db.insert('orgs', { name: ORG.name, slug: ORG.slug }));

    // ── USERS ────────────────────────────────────────────────────────────────
    const userIdByEmail: Record<string, Id<'users'>> = {};

    for (const u of USERS) {
      const existing = await ctx.db
        .query('users')
        .withIndex('by_email', (q: any) => q.eq('email', u.email))
        .first();

      const userID: Id<'users'> =
        existing?._id ??
        (await ctx.db.insert('users', {
          name: u.name,
          email: u.email,
          password: 'password123',
          avatarURL: avatar(u.email),
        }));

      userIdByEmail[u.email] = userID;
    }

    // ── PROJECTS ─────────────────────────────────────────────────────────────
    const projectIdBySlug: Record<string, Id<'projects'>> = {};

    for (const p of PROJECTS) {
      const existing = await ctx.db
        .query('projects')
        .withIndex('by_org_slug', (q: any) => q.eq('orgID', orgID).eq('slug', p.slug))
        .first();

      const creatorID = userIdByEmail[p.createdBy];

      const projectID: Id<'projects'> =
        existing?._id ??
        (await ctx.db.insert('projects', {
          orgID,
          name: p.name,
          slug: p.slug,
          description: p.description,
          createdBY: creatorID,
        }));

      projectIdBySlug[p.slug] = projectID;

      // Add members
      for (const email of p.members) {
        const userID = userIdByEmail[email];
        const memberExists = await ctx.db
          .query('projectMembers')
          .withIndex('by_project_user', (q: any) => q.eq('projectID', projectID).eq('userID', userID))
          .first();

        if (!memberExists) {
          await ctx.db.insert('projectMembers', { projectID, userID });
        }
      }
    }

    // ── TASKS ────────────────────────────────────────────────────────────────
    let taskCount = 0;

    for (const [slug, tasks] of Object.entries(TASKS)) {
      const projectID = projectIdBySlug[slug];
      if (!projectID) continue;

      for (const t of tasks) {
        await ctx.db.insert('tasks', {
          projectID,
          title: t.title,
          description: t.description,
          assigneeID: userIdByEmail[t.assignee],
          reporterID: userIdByEmail[t.reporter],
          status: t.status,
          isImportant: t.isImportant,
          isUrgent: t.isUrgent,
          completeBy: daysFromNow(t.dueInDays),
        });
        taskCount++;
      }
    }

    // ── WIKI ─────────────────────────────────────────────────────────────────
    for (const [slug, pages] of Object.entries(WIKI)) {
      const projectID = projectIdBySlug[slug];
      if (!projectID) continue;

      for (const w of pages) {
        const existing = await ctx.db
          .query('wiki')
          .withIndex('by_project_title', (q: any) => q.eq('projectID', projectID).eq('title', w.title))
          .first();

        if (!existing) {
          await ctx.db.insert('wiki', {
            projectID,
            title: w.title,
            content: w.content,
            lastEdited: daysAgo(w.daysAgo),
          });
        }
      }
    }

    // ── CHATS ────────────────────────────────────────────────────────────────
    const chatIdByName: Record<string, Id<'chats'>> = {};
    const allUserIds = Object.values(userIdByEmail);

    for (const chat of CHAT_GROUPS) {
      const existing = await ctx.db
        .query('chats')
        .withIndex('by_org_type_name', (q: any) => q.eq('orgID', orgID).eq('type', chat.type).eq('name', chat.name))
        .first();

      const chatID: Id<'chats'> =
        existing?._id ?? (await ctx.db.insert('chats', { orgID, type: chat.type, name: chat.name }));

      chatIdByName[chat.name] = chatID;

      const memberIds = chat.members === 'all' ? allUserIds : chat.members.map((e) => userIdByEmail[e]);

      for (const userID of memberIds) {
        const participantExists = await ctx.db
          .query('chatParticipants')
          .withIndex('by_chat_user', (q: any) => q.eq('chatID', chatID).eq('userID', userID))
          .first();

        if (!participantExists) {
          await ctx.db.insert('chatParticipants', { chatID, userID });
        }
      }
    }

    // ── DMs ──────────────────────────────────────────────────────────────────
    const dmChatKeys: Record<string, Id<'chats'>> = {};

    for (const [emailA, emailB] of DM_PAIRS) {
      const name = [emailA, emailB].sort().join(' ↔ ');
      const key = [emailA.split('@')[0], emailB.split('@')[0]].sort().join('-');

      const existing = await ctx.db
        .query('chats')
        .withIndex('by_org_type_name', (q: any) => q.eq('orgID', orgID).eq('type', 'dm').eq('name', name))
        .first();

      const chatID: Id<'chats'> = existing?._id ?? (await ctx.db.insert('chats', { orgID, type: 'dm', name }));

      dmChatKeys[key] = chatID;

      for (const email of [emailA, emailB]) {
        const userID = userIdByEmail[email];
        const participantExists = await ctx.db
          .query('chatParticipants')
          .withIndex('by_chat_user', (q: any) => q.eq('chatID', chatID).eq('userID', userID))
          .first();

        if (!participantExists) {
          await ctx.db.insert('chatParticipants', { chatID, userID });
        }
      }
    }

    // ── MESSAGES ─────────────────────────────────────────────────────────────
    for (const [chatName, messages] of Object.entries(MESSAGES)) {
      const chatID = chatIdByName[chatName] ?? dmChatKeys[chatName];
      if (!chatID) continue;

      for (const m of messages) {
        await ctx.db.insert('messages', {
          chatID,
          senderID: userIdByEmail[m.from],
          body: m.body,
          time: minutesAgo(m.minutesAgo),
        });
      }
    }

    return {
      ok: true as const,
      skipped: false,
      counts: {
        users: USERS.length,
        projects: PROJECTS.length,
        tasks: taskCount,
        chats: CHAT_GROUPS.length + DM_PAIRS.length,
      },
    };
  },
});
