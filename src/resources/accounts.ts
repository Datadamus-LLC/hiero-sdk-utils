// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { AccountInfo, AccountsQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';
import { ENTITY_ID_PATTERN } from '../types/common.js';

/**
 * Provides access to Mirror Node account endpoints.
 *
 * @example
 * ```ts
 * const account = await client.accounts.getById('0.0.1234');
 * for await (const a of client.accounts.list({ limit: 10 })) {
 *   console.log(a.account);
 * }
 * ```
 */
export class AccountsResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves a single account by ID.
   *
   * @param accountId - Account in `0.0.X` format
   * @returns The account info including balance, key, and staking data
   * @throws {ValidationError} If accountId format is invalid
   * @throws {MirrorNodeError} If the API request fails
   */
  async getById(accountId: string): Promise<AccountInfo> {
    this.validateAccountId(accountId);
    return this.client.get<AccountInfo>(`/api/v1/accounts/${accountId}`);
  }

  /**
   * Lists accounts with optional filters. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of account info objects
   *
   * @example
   * ```ts
   * for await (const account of client.accounts.list({ limit: 5, order: 'desc' })) {
   *   console.log(account.account, account.balance.balance);
   * }
   * ```
   */
  list(params?: AccountsQueryParams): AsyncIterable<AccountInfo> {
    return paginate<AccountInfo>(
      this.client,
      '/api/v1/accounts',
      'accounts',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  private validateAccountId(id: string): void {
    if (!ENTITY_ID_PATTERN.test(id)) {
      throw new ValidationError(
        `Invalid account ID format: "${id}". Expected "shard.realm.num" format (e.g., "0.0.1234").`,
        'INVALID_ACCOUNT_ID',
      );
    }
  }
}
