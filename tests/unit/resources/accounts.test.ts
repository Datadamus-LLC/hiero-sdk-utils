// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { ValidationError } from '../../../src/errors/index.js';
import * as fixtures from '../../fixtures/index.js';

describe('AccountsResource', () => {
  it('should fetch account by ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch(fixtures.accountInfo),
    });

    const account = await client.accounts.getById('0.0.1234');
    expect(account.account).toBe('0.0.1234');
    expect(account.balance.balance).toBe(100000000);
  });

  it('should throw ValidationError for invalid account ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.accounts.getById('invalid')).rejects.toThrow(ValidationError);
    await expect(client.accounts.getById('')).rejects.toThrow(ValidationError);
    await expect(client.accounts.getById('0.0')).rejects.toThrow(ValidationError);
  });

  it('should list accounts with pagination', async () => {
    const mockFetch = fixtures.createSequentialMockFetch([
      { body: fixtures.accountsListPage1 },
      { body: fixtures.accountsListPage2 },
    ]);

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: mockFetch,
    });

    const accounts: Array<{ account: string }> = [];
    for await (const account of client.accounts.list({ limit: 3 })) {
      accounts.push(account as { account: string });
    }

    expect(accounts).toHaveLength(5);
    expect(accounts[0]?.account).toBe('0.0.1');
    expect(accounts[4]?.account).toBe('0.0.5');
  });
});
