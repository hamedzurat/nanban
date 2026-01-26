---
trigger: always_on
---

# Code Style & Commenting Standards

## Goal

Ensure code is self-documenting through clear naming and that comments add value by explaining the _intent_ behind logic using simple, direct English.

## Constraints

- **NEVER** use emojis in comments (e.g., avoid 🚀, ⚠️, 🐛).
- **NEVER** use mdashes (—); use standard hyphens (-) or colons (:) instead.
- **NEVER** use complex, flowery, or "AI-generated" vocabulary (e.g., avoid "delve," "tapestry," "leverage," "paramount," "underscore"). Keep it conversational but professional.
- **NEVER** write comments that simply translate code into English (e.g., `// loop through items` before a `for` loop).
- **NEVER** leave commented-out code snippets. Delete them.
- **NEVER** use single-letter variable names (like `x`, `d`, `v`) except for simple loop counters (`i`, `j`).
- **NEVER** use vague names like `data`, `info`, `manager`, or `item` without context.

## Instructions

### 1. Naming Conventions

- **Variables & Functions:** Use `camelCase`. Names must be descriptive and reveal the entity's purpose.
  - **Bad:** `const val = 50;`
  - **Good:** `const maxRetryAttempts = 50;`
- **Booleans:** Must be prefixed with `is`, `has`, `should`, or `can` to indicate a true/false question.
  - **Bad:** `const valid = true;`
  - **Good:** `const isValidSession = true;`
- **Functions:** Must use a "Verb-Noun" pattern describing the action.
  - **Bad:** `function user() { ... }`
  - **Good:** `function fetchUserProfile() { ... }`
- **Constants:** Use `UPPER_SNAKE_CASE` for values that do not change during execution (config, magic numbers).

### 2. The "Why", Not the "What"

- Comments must explain **business logic**, **complex algorithms**, or **workarounds**.
- **Bad:** `// Set user to active`
- **Good:** `// Activating user immediately to prevent race condition in the auth flow.`

### 3. Public Interfaces (TSDoc)

- All exported functions, classes, and interfaces **MUST** use TSDoc (`/** ... */`) format.
- Include `@param`, `@returns`, and `@throws` tags where applicable.
- **Example:**

```typescript
  /**
   * Attempts to reserve a seat in the section.
   * @param studentId - The unique ID of the requesting student.
   * @returns A promise resolving to the reservation status.
   * @throws {SeatReservationError} If the section is locked or invalid.
   */
  export async function reserveSeat(studentId: string): Promise<Result> { ... }

```

### 4. TODOs and FIXMEs

- `TODO` comments must include a brief context or a GitHub issue reference.
- `FIXME` implies broken or dangerous code that needs immediate attention.
- **Format:** `// TODO: [Refactor] Extract this logic to a utility once the API stabilizes.`

### 5. Magic Numbers & Strings

- Do not comment magic numbers. Extract them into named constants and document the constant if necessary.
- **Bad:** `if (status === 2) // 2 means active`
- **Good:** `const STATUS_ACTIVE = 2; if (status === STATUS_ACTIVE) ...`

### 6. Tone & Style

- Be concise. Use short sentences.
- Avoid passive voice where possible.

## Examples

### Incorrect

```typescript
// 🚀 Iterating over the array to transformative effect — ensuring data integrity...
const d = list.map((i) => {
  // return the name
  return i.name;
});

function get(id: string) { ... }

```

### Correct

```typescript
// Map raw database rows to the frontend shape to avoid leaking internal IDs.
const safeUserList = rawUsers.map((user) => ({
  id: user.public_id,
  name: user.display_name,
}));

function fetchUserById(userId: string) { ... }

```
