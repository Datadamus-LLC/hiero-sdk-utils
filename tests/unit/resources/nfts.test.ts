// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { ValidationError } from '../../../src/errors/index.js';
import * as fixtures from '../../fixtures/index.js';

describe('NftsResource', () => {
  it('should fetch NFT by token and serial', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch(fixtures.nftInfo),
    });

    const nft = await client.nfts.getByTokenAndSerial('0.0.5678', 1);
    expect(nft.token_id).toBe('0.0.5678');
    expect(nft.serial_number).toBe(1);
  });

  it('should throw ValidationError for invalid token ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.nfts.getByTokenAndSerial('bad', 1)).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid serial number', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.nfts.getByTokenAndSerial('0.0.5678', 0)).rejects.toThrow(ValidationError);
    await expect(client.nfts.getByTokenAndSerial('0.0.5678', -1)).rejects.toThrow(ValidationError);
  });

  it('should list NFTs by token', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({
        nfts: [fixtures.nftInfo],
        links: { next: null },
      }),
    });

    const items: unknown[] = [];
    for await (const nft of client.nfts.listByToken('0.0.5678')) {
      items.push(nft);
    }
    expect(items).toHaveLength(1);
  });
});
