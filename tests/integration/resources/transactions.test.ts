// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { ValidationError } from '../../../src/errors/index.js';
import { TEST_CONFIG } from '../setup.js';

describe('TransactionsResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should list real transactions from testnet', async () => {
    let count = 0;
    for await (const tx of client.transactions.list({ limit: 5 })) {
      expect(tx).toHaveProperty('transaction_id');
      expect(tx).toHaveProperty('consensus_timestamp');
      expect(tx).toHaveProperty('result');
      count++;
      if (count >= 5) break;
    }
    expect(count).toBe(5);
  });

  it('should throw ValidationError for invalid transaction ID', async () => {
    await expect(
      client.transactions.getById('invalid'),
    ).rejects.toThrow(ValidationError);
  });

  it('should paginate transactions across pages', async () => {
    let count = 0;
    for await (const tx of client.transactions.list({ limit: 5 })) {
      expect(tx).toHaveProperty('transaction_id');
      count++;
      if (count >= 12) break;
    }
    expect(count).toBe(12);
  });
});
