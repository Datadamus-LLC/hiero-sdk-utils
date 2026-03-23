// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { NftInfo, NftsQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';
import { ENTITY_ID_PATTERN } from '../types/common.js';

/**
 * Provides access to Mirror Node NFT endpoints.
 *
 * @example
 * ```ts
 * for await (const nft of client.nfts.listByToken('0.0.1234')) {
 *   console.log(nft.serial_number, nft.account_id);
 * }
 * ```
 */
export class NftsResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves a specific NFT by token ID and serial number.
   *
   * @param tokenId - Token in `0.0.X` format
   * @param serialNumber - The NFT serial number
   * @returns The NFT info including metadata and owner
   * @throws {ValidationError} If tokenId format is invalid or serialNumber is not positive
   * @throws {MirrorNodeError} If the API request fails
   */
  async getByTokenAndSerial(tokenId: string, serialNumber: number): Promise<NftInfo> {
    this.validateTokenId(tokenId);
    this.validateSerialNumber(serialNumber);
    return this.client.get<NftInfo>(
      `/api/v1/tokens/${tokenId}/nfts/${serialNumber}`,
    );
  }

  /**
   * Lists NFTs for a token. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param tokenId - Token in `0.0.X` format
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of NFT info objects
   * @throws {ValidationError} If tokenId format is invalid
   */
  listByToken(tokenId: string, params?: NftsQueryParams): AsyncIterable<NftInfo> {
    this.validateTokenId(tokenId);
    return paginate<NftInfo>(
      this.client,
      `/api/v1/tokens/${tokenId}/nfts`,
      'nfts',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  private validateTokenId(id: string): void {
    if (!ENTITY_ID_PATTERN.test(id)) {
      throw new ValidationError(
        `Invalid token ID format: "${id}". Expected "shard.realm.num" format (e.g., "0.0.1234").`,
        'INVALID_TOKEN_ID',
      );
    }
  }

  private validateSerialNumber(serial: number): void {
    if (!Number.isInteger(serial) || serial <= 0) {
      throw new ValidationError(
        `Invalid serial number: ${serial}. Must be a positive integer.`,
        'INVALID_SERIAL_NUMBER',
      );
    }
  }
}
