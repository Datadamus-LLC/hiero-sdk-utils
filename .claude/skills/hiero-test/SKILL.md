---
name: hiero-test
description: "Integration testing skill for hiero-sdk-utils. Runs REAL tests against the live Hedera Mirror Node testnet — no mocks, no fakes, no stubs. Every test makes actual HTTP calls and validates actual API responses. Use this skill after developing any feature to verify it works against the real network. Mocking is explicitly forbidden in integration tests."
---

# Hiero Test — Real Integration Testing

This skill defines how integration tests work in `hiero-sdk-utils`. The core principle: **every integration test hits the real Hedera Mirror Node testnet**. No mocks. No stubs. No fakes. No recorded responses. If it can't reach the network, the test fails — and that's correct behavior.

## Why No Mocks

Mocks test your assumptions about an API. Integration tests test reality. This library's entire value proposition is correctly wrapping the Mirror Node API. If we mock the API, we're testing nothing. A mock that returns `{ account: "0.0.1234" }` proves nothing about whether the real API returns that shape. The Hedera Mirror Node testnet is free, public, and fast — there is zero reason to mock it.

## Test Configuration

Integration tests use the public Hedera testnet Mirror Node. No API keys, no authentication, no credentials needed.

```typescript
// SPDX-License-Identifier: Apache-2.0

// tests/integration/setup.ts
export const TEST_CONFIG = {
  baseUrl: 'https://testnet.mirrornode.hedera.com',
  // Well-known testnet accounts that always exist
  knownAccountId: '0.0.2',        // Node account, always exists
  knownTokenId: '0.0.1',          // Will need to discover a real one
  maxRequestsPerSecond: 10,       // Be polite to the testnet
} as const;
```

## Test Structure

Integration tests live in `tests/integration/` and mirror the resource structure:

```
tests/
├── integration/
│   ├── setup.ts                    # Shared config and helpers
│   ├── client.test.ts              # Client connectivity tests
│   ├── resources/
│   │   ├── accounts.test.ts
│   │   ├── transactions.test.ts
│   │   ├── tokens.test.ts
│   │   ├── topics.test.ts
│   │   ├── contracts.test.ts
│   │   ├── nfts.test.ts
│   │   ├── balances.test.ts
│   │   ├── blocks.test.ts
│   │   └── schedules.test.ts
│   └── pagination.test.ts          # Pagination against real data
└── unit/                           # Unit tests (separate, can use mocks for speed)
```

## Running Integration Tests

```bash
# Run only integration tests
npx vitest run tests/integration/

# Run a specific resource's integration tests
npx vitest run tests/integration/resources/accounts.test.ts
```

Integration tests should be tagged in vitest config so they can run separately from unit tests:

```typescript
// vitest.config.ts — add a separate project for integration
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          testTimeout: 30000, // 30s per test — network calls can be slow
        },
      },
    ],
  },
});
```

## Test Patterns

### Pattern 1: Verify Real Data Shape

The most important test: does the real API response match our TypeScript types?

```typescript
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient, Networks } from '../../src/index.js';
import { TEST_CONFIG } from './setup.js';

describe('AccountsResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should fetch a real account from testnet', async () => {
    const account = await client.accounts.getById(TEST_CONFIG.knownAccountId);

    // Verify the response has the expected shape — not hardcoded values,
    // but structural assertions that prove our types match reality
    expect(account).toHaveProperty('account');
    expect(account).toHaveProperty('balance');
    expect(account.balance).toHaveProperty('balance');
    expect(account.balance).toHaveProperty('timestamp');
    expect(typeof account.account).toBe('string');
    expect(account.account).toMatch(/^\d+\.\d+\.\d+$/);
    expect(typeof account.balance.balance).toBe('number');
  });

  it('should throw MirrorNodeError for non-existent account', async () => {
    await expect(
      client.accounts.getById('0.0.99999999999')
    ).rejects.toThrow(MirrorNodeError);
  });

  it('should throw ValidationError for invalid account ID format', async () => {
    await expect(
      client.accounts.getById('not-an-id')
    ).rejects.toThrow(ValidationError);
  });
});
```

### Pattern 2: Verify Pagination Actually Works

```typescript
it('should paginate through real accounts', async () => {
  let count = 0;
  const maxItems = 15; // Fetch across at least 2 pages

  for await (const account of client.accounts.list({ limit: 5 })) {
    expect(account).toHaveProperty('account');
    expect(typeof account.account).toBe('string');
    count++;
    if (count >= maxItems) break;
  }

  // We should have gotten items across multiple pages
  expect(count).toBe(maxItems);
});
```

### Pattern 3: Verify Error Details

```typescript
it('should include HTTP status in MirrorNodeError', async () => {
  try {
    await client.accounts.getById('0.0.99999999999');
    // Should not reach here
    expect.fail('Expected MirrorNodeError');
  } catch (error) {
    expect(error).toBeInstanceOf(MirrorNodeError);
    if (error instanceof MirrorNodeError) {
      expect(error.status).toBe(404);
      expect(error.code).toBe('ACCOUNT_NOT_FOUND');
      expect(error.message).toContain('0.0.99999999999');
    }
  }
});
```

### Pattern 4: Verify Each Resource Against Real Data

For every resource, at minimum test:

1. **Fetch a known entity** — proves the API path is correct and response type matches
2. **List with pagination** — proves the list endpoint works and paginator handles real `links.next`
3. **Handle not-found** — proves error handling works with real 404 responses
4. **Handle invalid input** — proves validation catches bad input before hitting the network

## Forbidden Patterns

These will cause the test to be rejected:

```typescript
// FORBIDDEN: Mocking fetch
vi.mock('fetch');
const mockFetch = vi.fn();

// FORBIDDEN: Mocking the client
vi.mock('../../src/client/HieroClient.js');

// FORBIDDEN: Using recorded/canned responses
const response = JSON.parse(fs.readFileSync('fixtures/account.json'));

// FORBIDDEN: Skipping network tests
it.skip('should fetch account', ...);

// FORBIDDEN: Ignoring errors
try { ... } catch { /* swallow */ }

// FORBIDDEN: Testing against hardcoded response values
expect(account.balance.balance).toBe(1000); // Balance changes!
```

## What IS Allowed

```typescript
// OK: Structural assertions (shape, types, patterns)
expect(account).toHaveProperty('account');
expect(typeof account.balance.balance).toBe('number');
expect(account.account).toMatch(/^\d+\.\d+\.\d+$/);

// OK: Range/existence assertions
expect(account.balance.balance).toBeGreaterThanOrEqual(0);

// OK: Checking known invariants
expect(account.account).toBe(TEST_CONFIG.knownAccountId); // We queried this specific ID

// OK: Breaking out of pagination after N items (to keep tests fast)
if (count >= 15) break;
```

## Test Reporting

After running integration tests, report:

```
INTEGRATION TEST REPORT
========================
Resource             Tests    Pass    Fail    Time
─────────────────────────────────────────────────
Client               3        3       0       1.2s
Accounts             4        4       0       3.1s
Transactions         4        4       0       2.8s
Tokens               4        4       0       2.5s
Topics               3        3       0       1.9s
Contracts            3        3       0       2.1s
NFTs                 3        3       0       2.3s
Balances             3        3       0       1.7s
Blocks               3        3       0       1.5s
Schedules            3        3       0       1.8s
Pagination           4        4       0       5.2s
─────────────────────────────────────────────────
TOTAL                37       37      0       26.1s

All tests hit real Hedera testnet Mirror Node.
Zero mocks. Zero stubs. Zero fakes.
```

## When Tests Fail

If an integration test fails:

1. **Check if testnet is down** — `curl -s https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.2 | head -c 200`
2. **Check if our types are wrong** — compare the actual response to our type definition
3. **Check if the API changed** — compare to the Swagger spec at `https://testnet.mirrornode.hedera.com/api/v1/docs/`
4. **Never "fix" a test by loosening assertions** — if the API returns something unexpected, update our types to match reality, don't weaken the test
