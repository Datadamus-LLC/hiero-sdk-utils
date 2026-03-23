// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { ContractInfo, ContractsQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';
import { ENTITY_ID_PATTERN } from '../types/common.js';

/**
 * Provides access to Mirror Node contract endpoints.
 *
 * @example
 * ```ts
 * const contract = await client.contracts.getById('0.0.1234');
 * for await (const c of client.contracts.list()) {
 *   console.log(c.contract_id);
 * }
 * ```
 */
export class ContractsResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves a single contract by ID.
   *
   * @param contractId - Contract in `0.0.X` format
   * @returns The contract info including EVM address and timestamps
   * @throws {ValidationError} If contractId format is invalid
   * @throws {MirrorNodeError} If the API request fails
   */
  async getById(contractId: string): Promise<ContractInfo> {
    this.validateContractId(contractId);
    return this.client.get<ContractInfo>(`/api/v1/contracts/${contractId}`);
  }

  /**
   * Lists contracts with optional filters. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of contract info objects
   */
  list(params?: ContractsQueryParams): AsyncIterable<ContractInfo> {
    return paginate<ContractInfo>(
      this.client,
      '/api/v1/contracts',
      'contracts',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  private validateContractId(id: string): void {
    if (!ENTITY_ID_PATTERN.test(id)) {
      throw new ValidationError(
        `Invalid contract ID format: "${id}". Expected "shard.realm.num" format (e.g., "0.0.1234").`,
        'INVALID_CONTRACT_ID',
      );
    }
  }
}
