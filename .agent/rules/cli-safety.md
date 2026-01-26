---
trigger: always_on
---

# CLI Safety Rules

## Goal

Ensure safe execution of shell commands and prevent accidental data loss during agent operations.

## Constraints

- **NEVER** use `rm`, `rmdir`, `shred`, or `unlink` for deleting files or directories.
- **NEVER** execute destructive commands without verifying the path first.
- **NEVER** bypass the trash bin for deletion tasks.

## Instructions

- When you need to delete a file or directory, you **MUST** use `trash-cli` (specifically the `trash` command) instead of `rm` or `rmdir`.
- If `trash-cli` is not installed or available, stop and request the user to install it; do not fallback to destructive commands silently.
- Always use the safe version of commands where possible.

## Examples (trash-cli Usage)

Use the following patterns for deletion and management:

- **Send a file or directory to the trash:**
  `trash path/to/file`

- **List all files in the trash:**
  `trash-list`

- **Interactively restore a file from the trash:**
  `trash-restore`

- **Empty the trash:**
  `trash-empty`

- **Permanently delete all files in the trash older than 10 days:**
  `trash-empty 10`

- **Remove specific files from the trash (e.g., matching a blob pattern):**
  `trash-rm "*.o"`

- **Remove all files with a specific original location:**
  `trash-rm /path/to/file_or_directory`
