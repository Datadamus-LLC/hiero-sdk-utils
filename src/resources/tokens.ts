// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { TokenInfo, TokensQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';
import { ENTITY_ID_PATTERN } from '../types/common.js';

/**
 * Provides access to Mirror Node token endpoints.
 *
 * @example
 * ```ts
 * const token = await client.tokens.getById('0.0.1234');
 * for await (const t of client.tokens.list({ type: 'FUNGIBLE_COMMON' })) {
 *   console.log(t.name, t.symbol);
 * }
 * ```
 */
export class TokensResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves a single token by ID.
   *
   * @param tokenId - Token in `0.0.X` format
   * @returns The token info including supply, keys, and custom fees
   * @throws {ValidationError} If tokenId format is invalid
   * @throws {MirrorNodeError} If the API request fails
   */
  async getById(tokenId: string): Promise<TokenInfo> {
    this.validateTokenId(tokenId);
    return this.client.get<TokenInfo>(`/api/v1/tokens/${tokenId}`);
  }

  /**
   * Lists tokens with optional filters. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of token info objects
   */
  list(params?: TokensQueryParams): AsyncIterable<TokenInfo> {
    return paginate<TokenInfo>(
      this.client,
      '/api/v1/tokens',
      'tokens',
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
}
