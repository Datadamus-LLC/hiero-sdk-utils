---
name: hiero-audit
description: "Deep code audit skill for hiero-sdk-utils. Run this before submission or when you want a thorough review of the entire codebase. Goes beyond validation to check architectural consistency, API design quality, documentation completeness, and production readiness. Use after all features are implemented and validation passes."
---

# Hiero Audit

This is the deep review. Run it when the library is feature-complete and validation passes. It checks things that automated tools miss.

## Audit Checklist

### 1. API Surface Consistency

Read every public export in `src/index.ts` and verify:

- Every resource class follows the same naming pattern: `{Name}Resource`
- Every `getById()` method has the same signature pattern (single ID string → single typed object)
- Every `list()` method returns `AsyncIterable<T>` with optional params
- Parameter naming is consistent across resources (e.g., `accountId`, `tokenId`, not sometimes `id` and sometimes `account`)
- Return types never include `null` or `undefined` — if something isn't found, throw a `MirrorNodeError` with status 404

**Why this matters:** A library with inconsistent naming or patterns across resources looks like it was written by different people in a rush. Consistency signals quality.

### 2. Error Message Quality

Read every error thrown in the codebase. For each one:

- Does the message help a developer debug the issue?
- Does it include the actual value that caused the error (e.g., `"Invalid account ID: 'abc'"`, not just `"Invalid account ID"`)?
- Is the error code unique and searchable (e.g., `ACCOUNT_NOT_FOUND`, not just `NOT_FOUND`)?
- Does it include the HTTP status when relevant?

### 3. Type Completeness

For every API response type in `src/types/api.ts`:

- Does it match the actual Mirror Node Swagger spec?
- Are optional fields marked with `?` (not `| undefined`)?
- Are timestamp fields typed as `string` (the Mirror Node returns ISO strings)?
- Are numeric strings (like balances) typed as `number` or `string` with a JSDoc note?
- Are nested objects typed (not `Record<string, unknown>` or similar loose types)?

### 4. Pagination Edge Cases

Review the paginator for handling of:

- Empty first page (API returns `{ accounts: [], links: { next: null } }`)
- Single item, no next page
- Response missing the `links` field entirely
- Response where `links.next` is an empty string
- Very large result sets (does the iterator actually yield items lazily, not buffer everything?)

### 5. Client Robustness

Review `HieroClient` for:

- HTTP error handling: does it check `response.ok` and throw `MirrorNodeError` with the status code?
- Rate limiting: does it actually throttle requests, or is it just a placeholder?
- Retry logic: does it retry on 429 (rate limit) and 503 (service unavailable)?
- Timeout: is there a configurable request timeout?
- JSON parse errors: if the API returns invalid JSON, does it throw a clear error?
- Base URL handling: does it strip trailing slashes? Handle double slashes in path construction?

### 6. README Quality

The README must include:

- One-line description of what the library does
- Installation instructions (`npm install`)
- Quick start example (create client → make a query → iterate results)
- API reference overview (link to or include all public methods)
- Configuration options (all `HieroClientConfig` fields explained)
- Error handling example
- Network selection example (mainnet/testnet/custom)
- Contributing section (link to CONTRIBUTING.md)
- License badge

### 7. Package.json Correctness

Verify:

- `name` is scoped or descriptive (e.g., `hiero-sdk-utils`)
- `version` starts at `0.1.0`
- `main` points to CJS output
- `module` points to ESM output
- `types` points to declaration files
- `exports` field properly maps `.` to ESM/CJS/types
- `files` field includes only `dist/` (source code should not be published)
- `engines` specifies Node >= 18
- `license` is `Apache-2.0`
- `keywords` include: `hedera`, `hiero`, `mirror-node`, `sdk`, `blockchain`
- No unnecessary dependencies in `dependencies` (devDependencies are fine)
- `scripts` include: `build`, `test`, `lint`, `typecheck`

### 8. CI/CD Pipeline

Review `.github/workflows/ci.yml`:

- Runs on push to `main` and on pull requests
- Tests on Node 18 and Node 20+
- Steps include: install, typecheck, lint, test, build
- Build output is verified (not just compiled but the package is complete)

### 9. Security Review

- No secrets, API keys, or credentials in the codebase
- No `eval()` or `new Function()` usage
- User input (account IDs, token IDs) is validated before being interpolated into URLs
- No prototype pollution vectors
- Dependencies are minimal and from trusted sources

### 10. Contribution Readiness

- CONTRIBUTING.md exists and references Hiero standards
- `.gitignore` excludes `node_modules/`, `dist/`, `.env*`, `.DS_Store`
- No generated files committed (`dist/`, `*.js.map` in source)
- Example `.env` is not committed; `.env.example` pattern used if needed

## Audit Report Format

```
AUDIT REPORT — hiero-sdk-utils
================================

API Surface Consistency:    [PASS/FAIL] — [notes]
Error Message Quality:      [PASS/FAIL] — [notes]
Type Completeness:          [PASS/FAIL] — [notes]
Pagination Edge Cases:      [PASS/FAIL] — [notes]
Client Robustness:          [PASS/FAIL] — [notes]
README Quality:             [PASS/FAIL] — [notes]
Package.json Correctness:   [PASS/FAIL] — [notes]
CI/CD Pipeline:             [PASS/FAIL] — [notes]
Security Review:            [PASS/FAIL] — [notes]
Contribution Readiness:     [PASS/FAIL] — [notes]

Overall: [X/10 passed]
Issues Found: [list each issue with file:line and what to fix]
```
