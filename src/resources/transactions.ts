// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { TransactionInfo, TransactionsQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';

/**
 * Provides access to Mirror Node transaction endpoints.
 *
 * @example
 * ```ts
 * for await (const tx of client.transactions.list({ limit: 10 })) {
 *   console.log(tx.transaction_id, tx.result);
 * }
 * ```
 */
export class TransactionsResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves a single transaction by its transaction ID.
   *
   * @param transactionId - Transaction ID in `shard.realm.num-ssssssssss-nnnnnnnnn` format
   * @returns The transaction info including transfers and result
   * @throws {ValidationError} If the transaction ID format is invalid
   * @throws {MirrorNodeError} If the API request fails
   */
  async getById(transactionId: string): Promise<TransactionInfo> {
    this.validateTransactionId(transactionId);
    const response = await this.client.get<{ transactions: ReadonlyArray<TransactionInfo> }>(
      `/api/v1/transactions/${transactionId}`,
    );
    const first = response.transactions[0];
    if (!first) {
      throw new ValidationError(
        `No transaction found for ID: "${transactionId}"`,
        'TRANSACTION_NOT_FOUND',
      );
    }
    return first;
  }

  /**
   * Lists transactions with optional filters. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of transaction info objects
   */
  list(params?: TransactionsQueryParams): AsyncIterable<TransactionInfo> {
    return paginate<TransactionInfo>(
      this.client,
      '/api/v1/transactions',
      'transactions',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  private validateTransactionId(id: string): void {
    // Format: 0.0.XXXX-SSSSSSSSSS-NNNNNNNNN
    if (!/^\d+\.\d+\.\d+-\d+-\d+$/.test(id)) {
      throw new ValidationError(
        `Invalid transaction ID format: "${id}". Expected "shard.realm.num-seconds-nanos" format.`,
        'INVALID_TRANSACTION_ID',
      );
    }
  }
}
