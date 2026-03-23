// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { ValidationError } from '../../../src/errors/index.js';
import * as fixtures from '../../fixtures/index.js';

describe('TokensResource', () => {
  it('should fetch token by ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch(fixtures.tokenInfo),
    });

    const token = await client.tokens.getById('0.0.5678');
    expect(token.token_id).toBe('0.0.5678');
    expect(token.name).toBe('TestToken');
    expect(token.symbol).toBe('TT');
  });

  it('should throw ValidationError for invalid token ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.tokens.getById('invalid')).rejects.toThrow(ValidationError);
  });

  it('should list tokens', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({
        tokens: [fixtures.tokenInfo],
        links: { next: null },
      }),
    });

    const tokens: unknown[] = [];
    for await (const token of client.tokens.list({ type: 'FUNGIBLE_COMMON' })) {
      tokens.push(token);
    }
    expect(tokens).toHaveLength(1);
  });
});
