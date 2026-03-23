---
name: hiero-rule-enforcer
description: "Enforces all hard rules for the hiero-sdk-utils library. This skill MUST be read before writing ANY code in this project. It contains Hiero contribution standards, TypeScript coding rules, error handling requirements, and architectural constraints. Use this skill every time you generate, edit, or review code in this repository — no exceptions."
---

# Hiero Rule Enforcer

You are the guardian of code quality for `hiero-sdk-utils`. Every line of code in this project must pass through these rules. If a rule is violated, the code must not be committed.

## Why This Exists

This library targets the Hiero ecosystem. It will be judged by Hiero maintainers who care deeply about contribution hygiene, type safety, and production readiness. A single `any` type, a swallowed error, or a hardcoded URL will signal amateur work and lose the bounty. These rules exist because Hiero's CONTRIBUTING.md demands them, and because production libraries earn trust through rigor.

---

## Hiero Contribution Standards (Non-Negotiable)

These come directly from https://github.com/hiero-ledger/.github/blob/main/CONTRIBUTING.md:

### License Headers
Every `.ts` file must start with the Apache-2.0 SPDX header:

```typescript
// SPDX-License-Identifier: Apache-2.0
```

### Commit Format
All commits must follow Conventional Commits:
- `feat(scope): description` for new features
- `fix(scope): description` for bug fixes
- `docs(scope): description` for documentation
- `test(scope): description` for tests
- `chore(scope): description` for maintenance
- `refactor(scope): description` for refactors

### Commit Signing
Every commit requires:
- GPG signature (`-S` flag)
- DCO sign-off (`-s` flag) with real name and email
- Author and Signed-off-by must match

Example: `git commit -S -s -m "feat(accounts): add getAccount query"`

### Repository Hygiene
- CONTRIBUTING.md must exist and reference Hiero standards
- LICENSE file must be Apache-2.0
- CI must pass before any merge consideration

---

## TypeScript Rules

### Zero `any` Policy
Never use `any`. Not in function parameters, not in return types, not in generics, not in type assertions. If you need a flexible type, use `unknown` and narrow it. The word `any` should not appear in source files (test utilities are the only exception, and even then prefer `unknown`).

Why: `any` silently disables the type checker. A library that leaks `any` into its public API is useless for type safety.

### No Default Exports
Every export must be named. Use `export { thing }` or `export function/class/type`. Never `export default`.

Why: Default exports create inconsistent import names across consumers. Named exports provide autocomplete and refactoring safety.

### Explicit Return Types on Public Functions
Every function or method that is part of the public API must have an explicit return type annotation. Private/internal functions may rely on inference.

```typescript
// Good
export function getAccount(id: string): Promise<AccountInfo> { ... }

// Bad
export function getAccount(id: string) { ... }
```

### JSDoc on All Public API
Every exported function, class, type, and interface must have a JSDoc comment explaining what it does, its parameters, and what it returns. Include `@example` blocks where useful.

```typescript
/**
 * Retrieves account information from the Mirror Node.
 *
 * @param accountId - The account ID in `0.0.X` format
 * @returns The account info including balance and key
 * @throws {MirrorNodeError} If the account does not exist
 *
 * @example
 * ```ts
 * const account = await client.accounts.getById('0.0.1234');
 * console.log(account.balance);
 * ```
 */
```

### Strict TypeScript Config
The project uses strict mode. These compiler options are non-negotiable:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `exactOptionalPropertyTypes: true`

---

## Error Handling Rules

### No Silent Failures
Never catch an error and do nothing with it. Never return `undefined` or `null` to signal failure. Every failure must be a thrown, typed error.

```typescript
// FORBIDDEN
try { ... } catch (e) { return undefined; }

// FORBIDDEN
try { ... } catch (e) { console.log(e); }

// CORRECT
try { ... } catch (e) { throw new MirrorNodeError('Failed to fetch account', { cause: e }); }
```

### Typed Error Hierarchy
All errors thrown by this library extend the base `HieroError` class:
- `HieroError` — base class
  - `MirrorNodeError` — HTTP/network errors from the Mirror Node API
  - `ValidationError` — invalid input (bad account ID format, etc.)
  - `PaginationError` — pagination-specific failures (broken next link, etc.)

Every error must include:
- A human-readable `message`
- An error `code` string (e.g., `'ACCOUNT_NOT_FOUND'`, `'RATE_LIMITED'`)
- The original `cause` if wrapping another error

### No String Throws
Never `throw 'something went wrong'`. Always throw an Error instance.

---

## Architecture Rules

### No Hardcoded URLs
Mirror Node base URLs (mainnet, testnet, previewnet) must come from the client configuration. Never hardcode `https://mainnet.mirrornode.hedera.com` or similar in resource modules.

```typescript
// FORBIDDEN
const url = 'https://mainnet.mirrornode.hedera.com/api/v1/accounts';

// CORRECT — URL comes from the client
const url = `${this.client.baseUrl}/api/v1/accounts`;
```

### No Runtime Dependencies Beyond Fetch
The library uses native `fetch` only. No axios, no node-fetch, no got, no superagent. The only runtime dependency is what Node.js 18+ provides natively.

Why: Fewer dependencies = fewer supply chain risks = more trust from ecosystem adopters.

### Resource Modules Are Pure Data Transformers
Each resource module (accounts, tokens, etc.) does three things:
1. Build a URL from parameters
2. Call the client's fetch method
3. Return typed data

They do not manage state, cache results, or have side effects beyond the HTTP call.

### Pagination Uses Async Iterators
All paginated endpoints return `AsyncIterable<T>`. The consumer uses `for await...of`. Pagination follows the Mirror Node's `links.next` field. This is not optional — every list endpoint must support pagination.

---

## File Naming & Structure

- All source files use `camelCase.ts` naming
- Test files mirror source files: `src/resources/accounts.ts` → `tests/unit/resources/accounts.test.ts`
- Barrel exports only in `src/index.ts` — no nested barrels
- No circular imports (the CI should catch these, but don't create them)

---

## What To Do When You're Unsure

If a rule doesn't cover a specific case, apply these principles in order:
1. Would this surprise a Hiero maintainer reviewing a PR? If yes, don't do it.
2. Does this introduce implicit behavior? If yes, make it explicit.
3. Could a consumer's code break silently if our API changes? If yes, add types/errors to prevent it.
