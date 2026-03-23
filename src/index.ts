// SPDX-License-Identifier: Apache-2.0

/**
 * hiero-sdk-utils — TypeScript utilities for the Hedera/Hiero Mirror Node.
 *
 * @example
 * ```ts
 * import { HieroClient, Networks } from 'hiero-sdk-utils';
 *
 * const client = new HieroClient({ baseUrl: Networks.testnet });
 *
 * // Fetch a single account
 * const account = await client.accounts.getById('0.0.1234');
 *
 * // Iterate through accounts with auto-pagination
 * for await (const a of client.accounts.list({ limit: 10 })) {
 *   console.log(a.account, a.balance.balance);
 * }
 * ```
 *
 * @packageDocumentation
 */

// Client
export { HieroClient } from './client/HieroClient.js';
export { Networks } from './client/types.js';
export type { HieroClientConfig, NetworkName } from './client/types.js';

// Errors
export {
  HieroError,
  MirrorNodeError,
  ValidationError,
  PaginationError,
} from './errors/index.js';

// Resources
export { AccountsResource } from './resources/accounts.js';
export { TransactionsResource } from './resources/transactions.js';
export { TokensResource } from './resources/tokens.js';
export { TopicsResource } from './resources/topics.js';
export { ContractsResource } from './resources/contracts.js';
export { NftsResource } from './resources/nfts.js';
export { BalancesResource } from './resources/balances.js';
export { BlocksResource } from './resources/blocks.js';
export { SchedulesResource } from './resources/schedules.js';

// Types
export type {
  AccountInfo,
  AccountBalance,
  AccountsQueryParams,
  TransactionInfo,
  TransactionsQueryParams,
  Transfer,
  TokenTransfer,
  NftTransfer,
  TokenInfo,
  TokensQueryParams,
  TokenBalance,
  TopicInfo,
  TopicMessage,
  TopicMessagesQueryParams,
  ContractInfo,
  ContractsQueryParams,
  NftInfo,
  NftsQueryParams,
  BalanceEntry,
  BalancesQueryParams,
  BlockInfo,
  BlocksQueryParams,
  ScheduleInfo,
  SchedulesQueryParams,
  Key,
} from './types/api.js';

export type {
  BaseQueryParams,
  TimestampFilter,
  PaginationLinks,
} from './types/common.js';

export { ENTITY_ID_PATTERN } from './types/common.js';

// Pagination
export { paginate } from './pagination/paginator.js';
