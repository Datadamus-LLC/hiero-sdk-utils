// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../src/client/HieroClient.js';
import { MirrorNodeError } from '../../src/errors/index.js';
import { TEST_CONFIG } from './setup.js';

describe('HieroClient (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should connect to testnet Mirror Node', async () => {
    const result = await client.get<Record<string, unknown>>('/api/v1/accounts/0.0.2');
    expect(result).toHaveProperty('account');
  });

  it('should throw MirrorNodeError for non-existent account', async () => {
    await expect(
      client.get('/api/v1/accounts/0.0.99999999999'),
    ).rejects.toThrow(MirrorNodeError);
  });

  it('should include status code in MirrorNodeError', async () => {
    try {
      await client.get('/api/v1/accounts/0.0.99999999999');
      expect.fail('Expected MirrorNodeError');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(MirrorNodeError);
      if (error instanceof MirrorNodeError) {
        expect(error.status).toBe(404);
      }
    }
  });
});
