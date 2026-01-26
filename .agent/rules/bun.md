---
trigger: always_on
---

# Package Manager & Runtime Rules

## Goal

Enforce the use of Bun as the exclusive package manager and runtime for this project.

## Constraints

- **NEVER** use `npm`, `yarn`, or `pnpm` commands.
- **NEVER** generate `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`.
- **NEVER** use `npx`; use `bunx` instead.
- **NEVER** suggest installing Node.js if Bun can handle the runtime requirement.

## Instructions

- **Installation:** Always use `bun install`.
- **Adding Packages:** Use `bun add <package>` (or `bun add -d` for dev dependencies).
- **Removing Packages:** Use `bun remove <package>`.
- **Updating Packages:** Use `bun update` to upgrade dependencies.
- **One-off Execution:** Use `bunx <command>` instead of `npx <command>` for running binaries from packages.
- **Scripts:** Use `bun run <script>`.
- **Execution:** Prefer running TypeScript/JavaScript files directly with `bun <file>` instead of `node <file>` or `ts-node`.
- **Testing:** Use `bun test` instead of `jest` or `vitest` unless the project configuration explicitly dictates otherwise.
- **Scaffolding:** Use `bun init` to set up new projects.
- If you see a `package-lock.json` file, ignore it and warn the user that this project uses `bun.lockb`.
