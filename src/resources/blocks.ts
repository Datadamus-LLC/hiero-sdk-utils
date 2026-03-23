// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { BlockInfo, BlocksQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';

/**
 * Provides access to Mirror Node block endpoints.
 *
 * @example
 * ```ts
 * const block = await client.blocks.getByHashOrNumber(12345);
 * for await (const b of client.blocks.list()) {
 *   console.log(b.number, b.hash);
 * }
 * ```
 */
export class BlocksResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves a single block by hash or number.
   *
   * @param hashOrNumber - Block hash (hex string) or block number
   * @returns The block info including hash, timestamp, and gas used
   * @throws {ValidationError} If the input is neither a valid hash nor a number
   * @throws {MirrorNodeError} If the API request fails
   */
  async getByHashOrNumber(hashOrNumber: string | number): Promise<BlockInfo> {
    this.validateHashOrNumber(hashOrNumber);
    return this.client.get<BlockInfo>(`/api/v1/blocks/${hashOrNumber}`);
  }

  /**
   * Lists blocks with optional filters. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of block info objects
   */
  list(params?: BlocksQueryParams): AsyncIterable<BlockInfo> {
    return paginate<BlockInfo>(
      this.client,
      '/api/v1/blocks',
      'blocks',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  private validateHashOrNumber(value: string | number): void {
    if (typeof value === 'number') {
      if (!Number.isInteger(value) || value < 0) {
        throw new ValidationError(
          `Invalid block number: ${value}. Must be a non-negative integer.`,
          'INVALID_BLOCK_NUMBER',
        );
      }
      return;
    }
    if (typeof value === 'string' && value.length === 0) {
      throw new ValidationError(
        'Block hash or number must not be empty.',
        'INVALID_BLOCK_IDENTIFIER',
      );
    }
  }
}
