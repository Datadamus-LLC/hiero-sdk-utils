// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { MirrorNodeError, ValidationError } from '../../../src/errors/index.js';
import { TEST_CONFIG } from '../setup.js';

describe('AccountsResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should fetch a real account from testnet', async () => {
    const account = await client.accounts.getById(TEST_CONFIG.knownAccountId);

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
      client.accounts.getById('0.0.99999999999'),
    ).rejects.toThrow(MirrorNodeError);
  });

  it('should throw ValidationError for invalid account ID format', async () => {
    await expect(
      client.accounts.getById('not-an-id'),
    ).rejects.toThrow(ValidationError);
  });

  it('should paginate through real accounts', async () => {
    let count = 0;
    const maxItems = 15;

    for await (const account of client.accounts.list({ limit: 5 })) {
      expect(account).toHaveProperty('account');
      expect(typeof (account as { account: string }).account).toBe('string');
      count++;
      if (count >= maxItems) break;
    }

    expect(count).toBe(maxItems);
  });
});
