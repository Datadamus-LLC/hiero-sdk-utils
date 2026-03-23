// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { TEST_CONFIG } from '../setup.js';

describe('BlocksResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should list real blocks from testnet', async () => {
    let count = 0;
    let firstBlockNumber = -1;

    for await (const block of client.blocks.list({ limit: 3, order: 'desc' })) {
      expect(block).toHaveProperty('number');
      expect(block).toHaveProperty('hash');
      expect(block).toHaveProperty('timestamp');
      if (count === 0) {
        firstBlockNumber = (block as { number: number }).number;
      }
      count++;
      if (count >= 3) break;
    }
    expect(count).toBe(3);

    // Fetch the first block by number
    if (firstBlockNumber >= 0) {
      const block = await client.blocks.getByHashOrNumber(firstBlockNumber);
      expect(block.number).toBe(firstBlockNumber);
    }
  });

  it('should fetch block by number', async () => {
    const block = await client.blocks.getByHashOrNumber(1);
    expect(block).toHaveProperty('number');
    expect(block).toHaveProperty('hash');
    expect(block.number).toBe(1);
  });
});
