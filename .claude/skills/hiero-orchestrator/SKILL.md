---
name: hiero-orchestrator
description: "Master orchestration skill for hiero-sdk-utils development. Coordinates the full development workflow: rule enforcement, development, validation, and audit. Use this when starting a new development session, when planning what to build next, or when you need the full pipeline run. This skill ensures nothing is skipped and work proceeds in the correct order."
---

# Hiero Orchestrator

This skill coordinates the entire development pipeline. It ensures rules are followed, code is written correctly, and quality is verified at every step.

## Development Pipeline

Every piece of work follows this pipeline. No step can be skipped.

```
┌─────────────────┐
│  1. RULES       │  Read hiero-rule-enforcer
│     (always)    │  Internalize all constraints before writing anything
└────────┬────────┘
         │
┌────────▼────────┐
│  2. PLAN        │  Define what you're building
│                 │  List the files to create/modify
│                 │  Identify types needed
└────────┬────────┘
         │
┌────────▼────────┐
│  3. DEVELOP     │  Read hiero-dev for patterns
│                 │  Write code following templates
│                 │  Write tests alongside implementation
└────────┬────────┘
         │
┌────────▼────────┐
│  4. VALIDATE    │  Read hiero-validate
│                 │  Run all 8 checks
│                 │  Fix any failures, loop back to step 3
└────────┬────────┘
         │
┌────────▼────────┐
│  5. AUDIT       │  Read hiero-audit (only at milestones)
│  (at milestones)│  Run deep review
│                 │  Fix issues, loop back to step 3
└─────────────────┘
```

## When To Run Each Skill

| Trigger | Skills to Run |
|---------|--------------|
| Starting a new feature | rules → plan → dev → validate |
| Fixing a validation failure | rules → dev → validate |
| All features complete | rules → audit → fix → validate |
| Before final submission | audit → validate → confirm |
| Reviewing someone's code change | rules → validate → audit |

## Task Ordering for This Project

Here is the recommended build order for `hiero-sdk-utils`. Each task should follow the full pipeline above.

### Phase 1: Foundation
1. Project scaffolding (package.json, tsconfig, CI, license, contributing)
2. Error hierarchy (`src/errors/index.ts`)
3. Common types (`src/types/common.ts`)
4. Core client (`src/client/HieroClient.ts` + `types.ts`)
5. Paginator (`src/pagination/paginator.ts`)

### Phase 2: Resources
6. Accounts resource + tests
7. Transactions resource + tests
8. Tokens resource + tests
9. Topics resource + tests
10. Contracts resource + tests
11. NFTs resource + tests
12. Balances resource + tests
13. Blocks resource + tests
14. Schedules resource + tests

### Phase 3: Polish
15. Barrel export (`src/index.ts`) — verify public API surface
16. README with full documentation
17. Final audit
18. Final validation

### Phase 4: Ship
19. Ensure CI passes on GitHub
20. Tag v0.1.0

## Parallel Work Guidance

When spawning subagents for development:

- Each resource module is independent — they can be built in parallel
- But ALL resources depend on the foundation (Phase 1) being complete
- Tests should be written with the implementation, not after
- Validation should run after each resource is complete, not at the end

## Quality Gates

**Before moving from Phase 1 to Phase 2:**
- Client can make a GET request and return typed JSON
- Paginator works with a mock response
- All errors can be instantiated and have correct `name`, `code`, `message`
- Validation passes (8/8)

**Before moving from Phase 2 to Phase 3:**
- Every resource has at least: `getById()`, `list()`, and input validation
- Every resource has unit tests for: success case, validation error, API error
- Validation passes (8/8)

**Before Phase 4:**
- Audit passes (10/10)
- README is complete with examples
- `npm pack` produces a clean tarball
- CI workflow runs and passes
