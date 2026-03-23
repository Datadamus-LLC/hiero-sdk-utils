// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import * as fixtures from '../../fixtures/index.js';

describe('BalancesResource', () => {
  it('should list balances', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({
        balances: [
          { account: '0.0.1', balance: 100, tokens: [] },
          { account: '0.0.2', balance: 200, tokens: [] },
        ],
        links: { next: null },
        timestamp: '1234567890.000000000',
      }),
    });

    const items: Array<{ account: string; balance: number }> = [];
    for await (const entry of client.balances.list({ limit: 2 })) {
      items.push(entry as { account: string; balance: number });
    }
    expect(items).toHaveLength(2);
    expect(items[0]?.account).toBe('0.0.1');
  });
});
