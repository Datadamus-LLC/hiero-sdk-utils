// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { ValidationError } from '../../../src/errors/index.js';
import { TEST_CONFIG } from '../setup.js';

describe('TokensResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should list real tokens from testnet', async () => {
    let count = 0;
    let firstTokenId = '';

    for await (const token of client.tokens.list({ limit: 5 })) {
      expect(token).toHaveProperty('token_id');
      expect(token).toHaveProperty('name');
      expect(token).toHaveProperty('symbol');
      expect(token).toHaveProperty('type');
      if (count === 0) {
        firstTokenId = (token as { token_id: string }).token_id;
      }
      count++;
      if (count >= 5) break;
    }
    expect(count).toBe(5);

    // Fetch the first discovered token by ID
    if (firstTokenId) {
      const token = await client.tokens.getById(firstTokenId);
      expect(token.token_id).toBe(firstTokenId);
    }
  });

  it('should throw ValidationError for invalid token ID', async () => {
    await expect(
      client.tokens.getById('bad-id'),
    ).rejects.toThrow(ValidationError);
  });
});
