# /build — Autonomous Build Pipeline

You are the autonomous builder for `hiero-sdk-utils`. When this command is invoked, you execute the full development pipeline for the next piece of work.

## Pre-Flight Check

### 0. Verify Git is Initialized
```bash
cd /sessions/sharp-dazzling-franklin/mnt/Hackathon/hiero-sdk-utils
git status 2>&1 | head -3
```
If git is not initialized, STOP and tell the user to run `/setup` first.

### 1. Read All Skills (mandatory)
Read these files in order — do not skip any:
1. `.claude/skills/hiero-rule-enforcer/SKILL.md` — internalize every rule
2. `.claude/skills/hiero-dev/SKILL.md` — internalize every pattern
3. `.claude/skills/hiero-test/SKILL.md` — understand test requirements

Do not write a single line of code until you have read all three.

## Determine What To Build Next

Check the current state of the project:

```bash
# What exists?
find src/ -name '*.ts' 2>/dev/null | sort
find tests/ -name '*.ts' 2>/dev/null | sort

# Does it compile?
npx tsc --noEmit 2>&1 | tail -5

# Do tests pass?
npx vitest run 2>&1 | tail -10

# What was the last commit?
git log --oneline -5 2>/dev/null
```

Then follow this build order. Pick the FIRST item that doesn't exist yet:

### Phase 1: Foundation (must be sequential)
1. `package.json`, `tsconfig.json`, `vitest.config.ts`, `.eslintrc.cjs` — project scaffold
2. `src/errors/index.ts` — error class hierarchy
3. `src/types/common.ts` — shared types (AccountId format, timestamps)
4. `src/types/api.ts` — Mirror Node API response types
5. `src/client/types.ts` — client config, Networks constant
6. `src/client/rateLimiter.ts` — rate limiting utility
7. `src/client/HieroClient.ts` — core HTTP client
8. `src/pagination/paginator.ts` — async iterator pagination
9. Unit tests for client + paginator + errors

### Phase 2: Resources (each is independent)
10. `src/resources/accounts.ts` + integration tests
11. `src/resources/transactions.ts` + integration tests
12. `src/resources/tokens.ts` + integration tests
13. `src/resources/topics.ts` + integration tests
14. `src/resources/contracts.ts` + integration tests
15. `src/resources/nfts.ts` + integration tests
16. `src/resources/balances.ts` + integration tests
17. `src/resources/blocks.ts` + integration tests
18. `src/resources/schedules.ts` + integration tests

### Phase 3: Polish
19. `src/index.ts` — barrel export, verify public API surface
20. README.md with full documentation and examples
21. CONTRIBUTING.md referencing Hiero standards
22. `.github/workflows/ci.yml`
23. LICENSE (Apache-2.0 full text)

## The Pipeline For Each Item

For each item you build, follow this exact sequence:

### Step 1: Plan (30 seconds)
State what you're building, which files will be created/modified, and what types/imports are needed.

### Step 2: Write Code
Follow the patterns from `hiero-dev`. Every file starts with `// SPDX-License-Identifier: Apache-2.0`. Every public function has JSDoc. No `any`. No silent errors. No hardcoded URLs.

### Step 3: Write Tests
- Unit tests go in `tests/unit/` — these CAN use mock fetch for speed
- Integration tests go in `tests/integration/` — these MUST hit real testnet
- Both are required for every resource module
- Tests must cover: success case, validation error, API error (404), and pagination (for list endpoints)

### Step 4: Validate
Run the validation checks from `hiero-validate`:

```bash
# Compile
npx tsc --noEmit

# Lint
npx eslint src/ tests/ --max-warnings 0

# Tests
npx vitest run

# Any scan
grep -rn '\bany\b' src/ --include='*.ts' | grep -v '// any-ok' | grep -v 'SPDX'

# License headers
for f in $(find src/ -name '*.ts'); do
  head -1 "$f" | grep -q 'SPDX-License-Identifier: Apache-2.0' || echo "MISSING: $f"
done

# Silent error scan
grep -rn 'catch' src/ --include='*.ts' -A 3
```

### Step 5: Fix
If any validation check fails, fix the issue and re-run validation. Do NOT move on with failures.

### Step 6: Report
Output a summary:

```
BUILD COMPLETE: [what was built]
Files created/modified: [list]
Unit tests: X pass / Y fail
Integration tests: X pass / Y fail
Validation: 8/8 checks pass
Next item to build: [next in the sequence]
```

## Rules That Are Enforced During Build

These are checked at every step. Violations must be fixed immediately:

- Every `.ts` file starts with `// SPDX-License-Identifier: Apache-2.0`
- Zero `any` types in source code
- Every `catch` block re-throws or throws a typed error
- Every public function has JSDoc with `@param`, `@returns`, `@throws`
- No hardcoded Mirror Node URLs outside `src/client/types.ts`
- Named exports only (no `export default`)
- Integration tests make real HTTP calls (no mocks, no stubs, no fakes)
- Every error includes: message, code string, and cause chain
- Input validation happens before network calls
- List endpoints return `AsyncIterable<T>` via the paginator

## If You Get Stuck

- **Compilation error you can't fix**: Show the full error and stop. Don't suppress it.
- **Integration test fails due to network**: Verify testnet is up first. If it's down, skip integration tests and note it. Don't mock.
- **Unclear API response shape**: Check the Swagger spec at `https://testnet.mirrornode.hedera.com/api/v1/docs/`
- **Not sure about a design decision**: Follow the pattern established by the first resource (accounts). Consistency over cleverness.
