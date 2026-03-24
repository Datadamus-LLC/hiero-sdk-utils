# Design: Monorepo Restructure, React Package, Examples, npm Publish

Date: 2026-03-24
Status: Approved

## Overview

Restructure `hiero-sdk-utils` from a single-package repository into an npm workspaces monorepo containing two publishable packages and a runnable examples directory. This mirrors the structure of the reference library (`hiero-enterprise-java`) which has a core module, framework-specific integration modules, and sample applications.

The goal is to make the library genuinely ecosystem-ready: installable from npm, demonstrable in a running React app, and structured in a way that production libraries are structured.

---

## 1. Repository Structure

The root of the repository becomes a workspace container. Nothing at the root is published to npm.

```
hiero-sdk-utils/                     repo root
├── packages/
│   ├── core/                        published as "hiero-sdk-utils"
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json            extends ../../tsconfig.base.json + adds DOM lib
│   │   ├── tsconfig.cjs.json
│   │   ├── tsconfig.eslint.json
│   │   ├── vitest.config.ts
│   │   └── .eslintrc.cjs
│   └── react/                       published as "hiero-sdk-utils-react"
│       ├── src/
│       │   ├── HieroProvider.tsx
│       │   ├── hooks/
│       │   │   ├── useAccount.ts
│       │   │   ├── useTransaction.ts
│       │   │   ├── useToken.ts
│       │   │   ├── useNFTs.ts
│       │   │   ├── useAccountTransactions.ts
│       │   │   └── useTopicMessages.ts
│       │   └── index.ts
│       ├── tests/
│       │   └── hooks/
│       ├── package.json
│       ├── tsconfig.json            extends ../../tsconfig.base.json + adds jsx + DOM lib
│       ├── tsconfig.eslint.json
│       ├── vitest.config.ts         environment: jsdom + alias for hiero-sdk-utils
│       └── .eslintrc.cjs
├── examples/
│   ├── README.md
│   ├── basic-queries.ts             runnable: npx tsx basic-queries.ts
│   ├── pagination.ts                runnable: npx tsx pagination.ts
│   ├── error-handling.ts            runnable: npx tsx error-handling.ts
│   └── react-app/                   runnable: npm install && npm run dev
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   └── components/
│       │       ├── AccountCard.tsx
│       │       ├── TransactionList.tsx
│       │       └── TokenCard.tsx
│       ├── index.html
│       ├── package.json             uses file: dependencies pointing to built dist/
│       └── vite.config.ts
├── package.json                     workspace root (private: true)
├── tsconfig.base.json               shared strict TypeScript options (no DOM — added per package)
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── .github/workflows/ci.yml
```

### Migration of existing code

All existing source files move from the root into `packages/core/`. The root `package.json` is replaced with a workspace root. Existing tests, configs, and scripts move with the source. Git history is preserved — this is a rename/move, not a rewrite.

### ESLint strategy

Each package is self-contained. There is no root `.eslintrc.cjs`. Each package has:
- Its own `.eslintrc.cjs` referencing `parserOptions.project: ['./tsconfig.eslint.json']`
- Its own `tsconfig.eslint.json` including its `src/` and `tests/` directories

The root has no ESLint config to prevent cascade into packages. Running `npm run lint --workspaces` executes each package's own lint script in isolation.

---

## 2. Shared TypeScript base (tsconfig.base.json)

Contains strict compiler options shared by all packages. Does **not** include `lib: DOM` — packages add it themselves based on their runtime environment.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  }
}
```

---

## 3. Root package.json (workspace root)

```json
{
  "name": "hiero-sdk-utils-workspace",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build":     "npm run build --workspaces --if-present",
    "test":      "npm run test --workspaces --if-present",
    "lint":      "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present"
  }
}
```

The root is `private: true` — never published. Root-level `npm test` runs all tests in all packages, including integration tests. CI uses targeted workspace scripts instead of root shortcuts.

---

## 4. Core package (packages/core)

The existing `hiero-sdk-utils` code moves here unchanged. Package name stays `"hiero-sdk-utils"`. All existing scripts, exports, engines, keywords, and publishConfig remain the same.

Additions to `package.json`:
- `"repository": { "directory": "packages/core" }` field

The existing `tsconfig.json` extends `../../tsconfig.base.json` and adds the options specific to the core package's Node + browser runtime:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "./dist/esm",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

The `DOM` lib is required because `HieroClient.ts` uses `fetch`, `AbortController`, `URLSearchParams`, and `setTimeout` directly.

`tsconfig.cjs.json` similarly extends the base and points `outDir` to `./dist/cjs` with `"module": "CommonJS"`.

---

## 5. React package (packages/react)

### Design decision: ESM-only

The react package produces only ESM output. No CJS build. This is intentional:
- React 18 and modern bundlers (Vite, webpack 5, Rollup) resolve ESM natively
- The primary consumers are React apps built with Vite or Next.js (both handle ESM)
- A CJS build of a JSX-containing package requires additional tooling complexity with no meaningful benefit

Consumers using legacy CJS setups must configure their bundler to handle ESM packages, which is standard practice for React libraries.

### Package config (packages/react/package.json)

```json
{
  "name": "hiero-sdk-utils-react",
  "version": "0.1.0",
  "type": "module",
  "description": "React hooks for the Hedera/Hiero Mirror Node — built on hiero-sdk-utils",
  "main": "./dist/esm/index.js",
  "types": "./dist/esm/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      }
    }
  },
  "files": ["dist/"],
  "engines": { "node": ">=18.0.0" },
  "scripts": {
    "build":          "tsc -p tsconfig.json",
    "test":           "vitest run",
    "lint":           "eslint src/ tests/ --max-warnings 0",
    "typecheck":      "tsc --noEmit",
    "prepublishOnly": "npm run typecheck && npm run lint && npm run test && npm run build"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "hiero-sdk-utils": ">=0.1.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.0.0",
    "jsdom": "^24.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  },
  "publishConfig": { "access": "public" },
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/dmitrijtitarenko/hiero-sdk-utils.git",
    "directory": "packages/react"
  },
  "homepage": "https://github.com/dmitrijtitarenko/hiero-sdk-utils#readme",
  "bugs": { "url": "https://github.com/dmitrijtitarenko/hiero-sdk-utils/issues" },
  "keywords": ["hedera", "hiero", "mirror-node", "react", "hooks", "blockchain"]
}
```

### TypeScript config (packages/react/tsconfig.json)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "./dist/esm",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

ESLint tsconfig (packages/react/tsconfig.eslint.json):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "tests/**/*.tsx"]
}
```

### Vitest config (packages/react/vitest.config.ts)

```typescript
// SPDX-License-Identifier: Apache-2.0
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Resolve hiero-sdk-utils from source during tests — no build step required
      'hiero-sdk-utils': path.resolve(__dirname, '../core/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    testTimeout: 10000,
  },
});
```

The alias resolves `hiero-sdk-utils` directly from the core package source during test runs. This means the core package does not need to be built before running react tests.

### HieroProvider

```tsx
interface HieroProviderProps {
  client: HieroClient;
  children: React.ReactNode;
}

export function HieroProvider({ client, children }: HieroProviderProps): JSX.Element
```

An internal `useHieroClient()` hook reads from context and throws a clear error if called outside `HieroProvider`.

### Hook return type

```typescript
interface HieroQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### Nullable IDs — conditional fetching

All ID parameters accept `null`. Passing `null` skips the fetch and returns `{ data: null, loading: false, error: null, refetch: noop }`.

```tsx
const { data } = useAccount(user?.accountId ?? null);
```

### List hooks — first page strategy

List hooks collect results into an array. They must not exhaust the async generator unboundedly.

Each list hook threads the effective limit back into the query params passed to the core method, ensuring only one API page is fetched:

```typescript
const effectiveLimit = params?.limit ?? 25;
const paramsWithLimit = { ...params, limit: effectiveLimit };

const results: T[] = [];
for await (const item of client.resource.method(id, paramsWithLimit)) {
  results.push(item);
  if (results.length >= effectiveLimit) break;
}
```

Both the API call and the break threshold use the same `effectiveLimit`. The `break` is a safety mechanism in case the API returns more items than requested.

### The six hooks

| Hook | Fetches | Core method | Return data type |
|---|---|---|---|
| `useAccount(id)` | single account | `client.accounts.getById(id)` | `AccountInfo` |
| `useTransaction(id)` | single transaction | `client.transactions.getById(id)` | `TransactionInfo` |
| `useToken(id)` | single token | `client.tokens.getById(id)` | `TokenInfo` |
| `useNFTs(tokenId, params?)` | NFT list (first page) | `client.nfts.listByToken(tokenId, params)` | `NftInfo[]` |
| `useAccountTransactions(accountId, params?)` | transaction list | `client.transactions.list({ ...params, 'account.id': accountId })` | `TransactionInfo[]` |
| `useTopicMessages(topicId, params?)` | HCS message list | `client.topics.listMessages(topicId, params)` | `TopicMessage[]` |

**`useNFTs` params type:** The hook accepts `NftsHookParams`, defined locally as:

```typescript
type NftsHookParams = Omit<NftsQueryParams, 'serialnumber'>;
```

This type is defined in `packages/react/src/hooks/useNFTs.ts` and is not exported. Consumers who need a single NFT by serial use `client.nfts.getByTokenAndSerial()` directly from the core library.

### Testing

Tests use `@testing-library/react` and Vitest with `jsdom` environment. Tests mock `HieroClient` methods via `vi.fn()` and verify:

- Loading is `true` during fetch, `false` after
- `data` populates on success
- `error` populates on thrown error
- No fetch when ID is `null`
- `refetch()` triggers a second call
- Hook re-fetches when ID prop changes

---

## 6. Examples

### Node.js scripts (examples/*.ts)

Three self-contained scripts, runnable with `npx tsx <file>.ts` from the `examples/` directory. Point at the public testnet. No credentials.

Prerequisite: Run `npm install` from the repo root first — this hoists `hiero-sdk-utils` into the root `node_modules/` via workspaces, making it importable from the examples scripts.

| File | Demonstrates |
|---|---|
| `basic-queries.ts` | `getById` for accounts, tokens, transactions |
| `pagination.ts` | `for await...of` through paginated results, early break |
| `error-handling.ts` | `ValidationError` on bad input, `MirrorNodeError` on 404 |

Each script begins with a comment explaining what it demonstrates and how to run it.

### React app (examples/react-app/)

A minimal Vite + React 18 application. The react-app is not an npm workspace. Its dependencies reference the built packages via `file:` paths.

**Prerequisite:** Build packages first from the repo root:
```bash
npm run build  # from repo root
```

Then:
```bash
cd examples/react-app
npm install
npm run dev
```

```json
{
  "dependencies": {
    "hiero-sdk-utils": "file:../../packages/core",
    "hiero-sdk-utils-react": "file:../../packages/react",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.0.0"
  }
}
```

Note: `file:` paths reference the package directories directly (npm resolves them using the `main`/`exports` fields inside). The packages must be built before `npm install` in the react-app resolves them.

Three components:

- **AccountCard** — search by account ID, shows balance, key type, creation timestamp
- **TransactionList** — recent transactions for a searched account
- **TokenCard** — search by token ID, shows name, symbol, supply, type

Uses `HieroProvider` and all six hooks. Connects to testnet by default. No styling framework — plain CSS.

The react-app is not tested in CI and is not published.

---

## 7. npm Publish

### Authentication

```bash
npm login   # username: dmitrijtitarenko
```

### Publish

```bash
npm run build --workspaces
npm publish --workspace packages/core
npm publish --workspace packages/react
```

Both packages have `"publishConfig": { "access": "public" }` and `prepublishOnly` scripts that run typecheck, lint, test, and build before publishing.

CI does not auto-publish. Publishing is a manual step.

---

## 8. GitHub Release (v0.1.0)

The existing `v0.1.0` tag points to the pre-monorepo commit. After the monorepo migration and publish, the tag is moved to the final `main` commit:

```bash
git tag -d v0.1.0
git push origin :refs/tags/v0.1.0
git tag -s v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

Then create the release:

```bash
gh release create v0.1.0 --title "v0.1.0" --notes-file RELEASE_NOTES.md
```

Release notes: factual, no emojis. Covers: what is included, installation for both packages, compatibility (Node 18+, React 18+), links to README and examples.

---

## 9. CI Pipeline

Matrix: Node 18, 20, 22.

```yaml
steps:
  1. Install:            npm ci
  2. Typecheck all:      npm run typecheck --workspaces --if-present
  3. Lint all:           npm run lint --workspaces --if-present
  4. Core unit tests:    npm run test:unit --workspace packages/core
  5. Core integration:   npm run test:integration --workspace packages/core
  6. React tests:        npm run test --workspace packages/react
  7. Build all:          npm run build --workspaces --if-present
  8. Verify core:        npm pack --dry-run --workspace packages/core
  9. Verify react:       npm pack --dry-run --workspace packages/react
```

React tests (step 6) resolve `hiero-sdk-utils` from source via the vitest alias — no build step required before running react tests.

---

## 10. Implementation Order

1. Restructure repo — move core into `packages/core`, create workspace root and `tsconfig.base.json`
2. Validate — core builds and all 92 existing tests pass
3. Implement `packages/react` — `HieroProvider`, 6 hooks, tests, full package config
4. Validate — react package builds, lint clean, tests pass
5. Write Node.js example scripts
6. Build Vite React example app
7. npm login and publish both packages
8. Retag `v0.1.0` from final `main` commit, create GitHub Release
