// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { TEST_CONFIG } from '../setup.js';

describe('BalancesResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should list real balances from testnet', async () => {
    let count = 0;

    for await (const entry of client.balances.list({ limit: 5 })) {
      expect(entry).toHaveProperty('account');
      expect(entry).toHaveProperty('balance');
      expect(typeof (entry as { balance: number }).balance).toBe('number');
      count++;
      if (count >= 10) break;
    }
    expect(count).toBeGreaterThanOrEqual(5);
  });
});
