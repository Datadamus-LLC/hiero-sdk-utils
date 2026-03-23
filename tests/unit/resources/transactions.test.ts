// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { ValidationError } from '../../../src/errors/index.js';
import * as fixtures from '../../fixtures/index.js';

describe('TransactionsResource', () => {
  it('should fetch transaction by ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({ transactions: [fixtures.transactionInfo] }),
    });

    const tx = await client.transactions.getById('0.0.1234-1234567890-000000001');
    expect(tx.transaction_id).toBe('0.0.1234-1234567890-000000001');
    expect(tx.result).toBe('SUCCESS');
  });

  it('should throw ValidationError for invalid transaction ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.transactions.getById('invalid')).rejects.toThrow(ValidationError);
    await expect(client.transactions.getById('0.0.1234')).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError when API returns empty transactions array', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({ transactions: [] }),
    });

    await expect(
      client.transactions.getById('0.0.1234-1234567890-000000001'),
    ).rejects.toThrow(ValidationError);
  });

  it('should list transactions', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({
        transactions: [fixtures.transactionInfo],
        links: { next: null },
      }),
    });

    const txs: unknown[] = [];
    for await (const tx of client.transactions.list({ limit: 1 })) {
      txs.push(tx);
    }
    expect(txs).toHaveLength(1);
  });
});
