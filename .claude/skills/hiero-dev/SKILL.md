---
name: hiero-dev
description: "Development skill for writing code in the hiero-sdk-utils library. Use this whenever writing new modules, adding resource endpoints, creating types, or implementing features. Contains the library's architecture patterns, file conventions, and implementation templates. Always read hiero-rule-enforcer FIRST, then use this skill for the actual coding patterns."
---

# Hiero Dev Skill

This skill contains the patterns and templates for developing `hiero-sdk-utils`. Before using this skill, ensure you have read `hiero-rule-enforcer` — the rules there are prerequisites.

## Project Structure

```
hiero-sdk-utils/
├── src/
│   ├── client/
│   │   ├── HieroClient.ts          # Core HTTP client
│   │   ├── types.ts                 # Client config types
│   │   └── rateLimiter.ts           # Rate limiting logic
│   ├── resources/
│   │   ├── accounts.ts              # /api/v1/accounts
│   │   ├── transactions.ts          # /api/v1/transactions
│   │   ├── tokens.ts                # /api/v1/tokens
│   │   ├── topics.ts                # /api/v1/topics
│   │   ├── contracts.ts             # /api/v1/contracts
│   │   ├── nfts.ts                  # /api/v1/tokens/{id}/nfts
│   │   ├── balances.ts              # /api/v1/balances
│   │   ├── blocks.ts                # /api/v1/blocks
│   │   └── schedules.ts             # /api/v1/schedules
│   ├── pagination/
│   │   └── paginator.ts             # AsyncIterable pagination
│   ├── errors/
│   │   └── index.ts                 # Error class hierarchy
│   ├── types/
│   │   ├── api.ts                   # Mirror Node API response types
│   │   └── common.ts                # Shared types (AccountId, etc.)
│   └── index.ts                     # Public barrel export
├── tests/
│   ├── unit/
│   │   ├── client/
│   │   ├── resources/
│   │   └── pagination/
│   └── fixtures/                    # Mock API response data
├── .github/workflows/ci.yml
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Core Patterns

### The HieroClient

The client is the entry point. It holds configuration and provides HTTP methods that resource modules use.

```typescript
// SPDX-License-Identifier: Apache-2.0

export interface HieroClientConfig {
  /** The Mirror Node base URL (no trailing slash) */
  baseUrl: string;
  /** Optional: max requests per second (default: 20) */
  maxRequestsPerSecond?: number;
  /** Optional: custom fetch implementation for testing */
  fetch?: typeof globalThis.fetch;
  /** Optional: default headers to include in all requests */
  headers?: Record<string, string>;
}

/** Pre-configured network endpoints */
export const Networks = {
  mainnet: 'https://mainnet.mirrornode.hedera.com',
  testnet: 'https://testnet.mirrornode.hedera.com',
  previewnet: 'https://previewnet.mirrornode.hedera.com',
} as const satisfies Record<string, string>;

export type NetworkName = keyof typeof Networks;
```

The client exposes resource namespaces:
```typescript
const client = new HieroClient({ baseUrl: Networks.testnet });
const account = await client.accounts.getById('0.0.1234');
```

### Resource Module Pattern

Every resource module follows the same structure. Here's the template:

```typescript
// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { AccountInfo, AccountsQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';

/**
 * Provides access to Mirror Node account endpoints.
 *
 * @example
 * ```ts
 * const accounts = client.accounts;
 * const info = await accounts.getById('0.0.1234');
 * ```
 */
export class AccountsResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves a single account by ID.
   *
   * @param accountId - Account in `0.0.X` format
   * @throws {ValidationError} If accountId format is invalid
   * @throws {MirrorNodeError} If the API request fails
   */
  async getById(accountId: string): Promise<AccountInfo> {
    this.validateAccountId(accountId);
    return this.client.get<AccountInfo>(`/api/v1/accounts/${accountId}`);
  }

  /**
   * Lists accounts with optional filters. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param params - Optional query parameters for filtering
   *
   * @example
   * ```ts
   * for await (const account of client.accounts.list({ limit: 10 })) {
   *   console.log(account.account);
   * }
   * ```
   */
  list(params?: AccountsQueryParams): AsyncIterable<AccountInfo> {
    return paginate<AccountInfo>(
      this.client,
      '/api/v1/accounts',
      'accounts',
      params,
    );
  }

  private validateAccountId(id: string): void {
    if (!/^\d+\.\d+\.\d+$/.test(id)) {
      throw new ValidationError(
        `Invalid account ID format: "${id}". Expected "0.0.X" format.`,
        'INVALID_ACCOUNT_ID',
      );
    }
  }
}
```

Key points:
- Constructor receives `HieroClient` instance (dependency injection)
- `getById()` returns a single typed object
- `list()` returns `AsyncIterable<T>` using the paginator
- Input validation happens in the resource, throws `ValidationError`
- All HTTP calls go through `this.client.get()`

### Pagination Pattern

The paginator is a reusable function that creates an `AsyncIterable`:

```typescript
// SPDX-License-Identifier: Apache-2.0

export async function* paginate<T>(
  client: HieroClient,
  path: string,
  dataKey: string,
  params?: Record<string, unknown>,
): AsyncGenerator<T, void, undefined> {
  let url: string | null = buildUrl(path, params);

  while (url !== null) {
    const response = await client.get<PaginatedResponse<T>>(url);
    const items = response[dataKey];

    if (!Array.isArray(items)) {
      throw new PaginationError(
        `Expected array at key "${dataKey}", got ${typeof items}`,
        'INVALID_RESPONSE_SHAPE',
      );
    }

    for (const item of items) {
      yield item;
    }

    url = response.links?.next ?? null;
  }
}
```

### Error Pattern

```typescript
// SPDX-License-Identifier: Apache-2.0

export class HieroError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'HieroError';
  }
}

export class MirrorNodeError extends HieroError {
  constructor(
    message: string,
    code: string,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, code, options);
    this.name = 'MirrorNodeError';
  }
}

export class ValidationError extends HieroError {
  constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, code, options);
    this.name = 'ValidationError';
  }
}

export class PaginationError extends HieroError {
  constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, code, options);
    this.name = 'PaginationError';
  }
}
```

### Type Definitions Pattern

API response types go in `src/types/api.ts`. They must match the Mirror Node Swagger spec exactly. Use `interface` for object shapes (not `type`).

```typescript
// SPDX-License-Identifier: Apache-2.0

export interface AccountInfo {
  account: string;
  alias: string | null;
  balance: AccountBalance;
  created_timestamp: string | null;
  decline_reward: boolean;
  deleted: boolean;
  ethereum_nonce: number;
  evm_address: string | null;
  expiry_timestamp: string | null;
  key: Key | null;
  max_automatic_token_associations: number;
  memo: string;
  pending_reward: number;
  receiver_sig_required: boolean;
  staked_account_id: string | null;
  staked_node_id: number | null;
  stake_period_start: string | null;
}
```

### Test Pattern

Tests use Vitest. Mock the HTTP layer, not the resource logic.

```typescript
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi } from 'vitest';
import { HieroClient } from '../../src/client/HieroClient.js';
import { Networks } from '../../src/client/types.js';

describe('AccountsResource', () => {
  it('should fetch account by ID', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(fixtures.accountInfo),
    });

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: mockFetch,
    });

    const account = await client.accounts.getById('0.0.1234');

    expect(account.account).toBe('0.0.1234');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/accounts/0.0.1234'),
      expect.any(Object),
    );
  });

  it('should throw ValidationError for invalid account ID', async () => {
    const client = new HieroClient({ baseUrl: Networks.testnet });

    await expect(client.accounts.getById('invalid'))
      .rejects.toThrow(ValidationError);
  });
});
```

Key: inject a mock `fetch` via the client config. This avoids mocking globals and keeps tests isolated.

### Adding a New Resource

When adding a new resource module:

1. Create the API types in `src/types/api.ts`
2. Create the resource class in `src/resources/{name}.ts`
3. Register it in `HieroClient` constructor
4. Export it from `src/index.ts`
5. Add fixtures in `tests/fixtures/`
6. Write unit tests in `tests/unit/resources/{name}.test.ts`
7. Update README with usage example

Every resource follows the same pattern: `getById()`, `list()`, and any resource-specific methods. Always validate inputs. Always return typed data. Always paginate list endpoints.
