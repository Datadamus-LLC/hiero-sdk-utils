// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { MirrorNodeError, ValidationError } from '../../../src/errors/index.js';
import { TEST_CONFIG } from '../setup.js';

describe('NftsResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should fetch a real NFT by token and serial from testnet', async () => {
    const nft = await client.nfts.getByTokenAndSerial(
      TEST_CONFIG.knownNftTokenId,
      TEST_CONFIG.knownNftSerial,
    );

    expect(nft).toHaveProperty('token_id');
    expect(nft).toHaveProperty('serial_number');
    expect(nft).toHaveProperty('account_id');
    expect(nft.token_id).toBe(TEST_CONFIG.knownNftTokenId);
    expect(nft.serial_number).toBe(TEST_CONFIG.knownNftSerial);
    expect(typeof nft.serial_number).toBe('number');
  });

  it('should throw ValidationError for invalid token ID format', async () => {
    await expect(
      client.nfts.getByTokenAndSerial('not-a-token', 1),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid serial number', async () => {
    await expect(
      client.nfts.getByTokenAndSerial(TEST_CONFIG.knownNftTokenId, 0),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw MirrorNodeError for non-existent NFT serial', async () => {
    await expect(
      client.nfts.getByTokenAndSerial(TEST_CONFIG.knownNftTokenId, 99999999),
    ).rejects.toThrow(MirrorNodeError);
  });

  it('should list NFTs for a real token from testnet', async () => {
    let count = 0;
    for await (const nft of client.nfts.listByToken(TEST_CONFIG.knownNftTokenId)) {
      expect(nft).toHaveProperty('token_id');
      expect(nft).toHaveProperty('serial_number');
      expect(nft.token_id).toBe(TEST_CONFIG.knownNftTokenId);
      count++;
      if (count >= 5) break;
    }
    expect(count).toBeGreaterThan(0);
  });
});
