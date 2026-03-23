// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { ValidationError } from '../../../src/errors/index.js';
import * as fixtures from '../../fixtures/index.js';

describe('BlocksResource', () => {
  it('should fetch block by number', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch(fixtures.blockInfo),
    });

    const block = await client.blocks.getByHashOrNumber(12345);
    expect(block.number).toBe(12345);
  });

  it('should fetch block by hash', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch(fixtures.blockInfo),
    });

    const block = await client.blocks.getByHashOrNumber('0xabc123def456');
    expect(block.hash).toBe('0xabc123def456');
  });

  it('should throw ValidationError for negative block number', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.blocks.getByHashOrNumber(-1)).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for empty hash', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.blocks.getByHashOrNumber('')).rejects.toThrow(ValidationError);
  });

  it('should list blocks', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({
        blocks: [fixtures.blockInfo],
        links: { next: null },
      }),
    });

    const items: unknown[] = [];
    for await (const b of client.blocks.list()) {
      items.push(b);
    }
    expect(items).toHaveLength(1);
  });
});
