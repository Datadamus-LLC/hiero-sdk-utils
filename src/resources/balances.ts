// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { BalanceEntry, BalancesQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';

/**
 * Provides access to Mirror Node balance endpoints.
 *
 * @example
 * ```ts
 * for await (const entry of client.balances.list({ limit: 10 })) {
 *   console.log(entry.account, entry.balance);
 * }
 * ```
 */
export class BalancesResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Lists account balances with optional filters. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of balance entry objects
   */
  list(params?: BalancesQueryParams): AsyncIterable<BalanceEntry> {
    return paginate<BalanceEntry>(
      this.client,
      '/api/v1/balances',
      'balances',
      params as Record<string, string | number | boolean | undefined>,
    );
  }
}
