// SPDX-License-Identifier: Apache-2.0

import type { BaseQueryParams, TimestampFilter } from './common.js';

// ─── Account Types ───────────────────────────────────────────────────────────

/** Key object as returned by the Mirror Node */
export interface Key {
  _type: string;
  key: string;
}

/** Balance information nested within an account response */
export interface AccountBalance {
  balance: number;
  timestamp: string;
  tokens: ReadonlyArray<TokenBalance>;
}

/** Token balance associated with an account */
export interface TokenBalance {
  token_id: string;
  balance: number;
}

/** Full account info as returned by GET /api/v1/accounts/{id} */
export interface AccountInfo {
  account: string;
  alias: string | null;
  auto_renew_period: number | null;
  balance: AccountBalance;
  created_timestamp: string | null;
  decline_reward: boolean;
  deleted: boolean;
  ethereum_nonce: number;
  evm_address: string | null;
  expiry_timestamp: string | null;
  key: Key | null;
  max_automatic_token_associations: number;
  memo: string;
  pending_reward: number;
  receiver_sig_required: boolean;
  staked_account_id: string | null;
  staked_node_id: number | null;
  stake_period_start: string | null;
}

/** Query parameters for listing accounts */
export interface AccountsQueryParams extends BaseQueryParams, TimestampFilter {
  'account.id'?: string;
  'account.balance'?: string;
  'account.publickey'?: string;
}

// ─── Transaction Types ───────────────────────────────────────────────────────

/** Transfer within a transaction */
export interface Transfer {
  account: string;
  amount: number;
  is_approval: boolean;
}

/** Token transfer within a transaction */
export interface TokenTransfer {
  token_id: string;
  account: string;
  amount: number;
  is_approval: boolean;
}

/** NFT transfer within a transaction */
export interface NftTransfer {
  is_approval: boolean;
  receiver_account_id: string;
  sender_account_id: string;
  serial_number: number;
  token_id: string;
}

/** Full transaction info as returned by the Mirror Node */
export interface TransactionInfo {
  bytes: string | null;
  charged_tx_fee: number;
  consensus_timestamp: string;
  entity_id: string | null;
  max_fee: string;
  memo_base64: string;
  name: string;
  nft_transfers: ReadonlyArray<NftTransfer>;
  node: string | null;
  nonce: number;
  parent_consensus_timestamp: string | null;
  result: string;
  scheduled: boolean;
  staking_reward_transfers: ReadonlyArray<Transfer>;
  token_transfers: ReadonlyArray<TokenTransfer>;
  transaction_hash: string;
  transaction_id: string;
  transfers: ReadonlyArray<Transfer>;
  valid_duration_seconds: string;
  valid_start_timestamp: string;
}

/** Query parameters for listing transactions */
export interface TransactionsQueryParams extends BaseQueryParams, TimestampFilter {
  'account.id'?: string;
  result?: 'success' | 'fail';
  type?: string;
  transactiontype?: string;
}

// ─── Token Types ─────────────────────────────────────────────────────────────

/** Custom fee for a token */
export interface CustomFee {
  created_timestamp: string;
  fixed_fees: ReadonlyArray<Record<string, unknown>>;
  fractional_fees: ReadonlyArray<Record<string, unknown>>;
  royalty_fees: ReadonlyArray<Record<string, unknown>>;
}

/** Full token info as returned by GET /api/v1/tokens/{id} */
export interface TokenInfo {
  admin_key: Key | null;
  auto_renew_account: string | null;
  auto_renew_period: number | null;
  created_timestamp: string;
  custom_fees: CustomFee;
  decimals: string;
  deleted: boolean;
  expiry_timestamp: string | null;
  fee_schedule_key: Key | null;
  freeze_default: boolean;
  freeze_key: Key | null;
  initial_supply: string;
  kyc_key: Key | null;
  max_supply: string;
  memo: string;
  modified_timestamp: string;
  name: string;
  pause_key: Key | null;
  pause_status: string;
  supply_key: Key | null;
  supply_type: string;
  symbol: string;
  token_id: string;
  total_supply: string;
  treasury_account_id: string;
  type: string;
  wipe_key: Key | null;
}

/** Query parameters for listing tokens */
export interface TokensQueryParams extends BaseQueryParams {
  publickey?: string;
  'token.id'?: string;
  type?: 'ALL' | 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE';
  name?: string;
}

// ─── Topic Types ─────────────────────────────────────────────────────────────

/** Topic info as returned by GET /api/v1/topics/{id} */
export interface TopicInfo {
  admin_key: Key | null;
  auto_renew_account: string | null;
  auto_renew_period: number | null;
  created_timestamp: string;
  deleted: boolean;
  memo: string;
  submit_key: Key | null;
  timestamp: { from: string; to: string | null };
  topic_id: string;
}

/** Topic message as returned by GET /api/v1/topics/{id}/messages */
export interface TopicMessage {
  chunk_info: { initial_transaction_id: string; number: number; total: number } | null;
  consensus_timestamp: string;
  message: string;
  payer_account_id: string;
  running_hash: string;
  running_hash_version: number;
  sequence_number: number;
  topic_id: string;
}

/** Query parameters for listing topic messages */
export interface TopicMessagesQueryParams extends BaseQueryParams, TimestampFilter {
  sequencenumber?: number;
}

// ─── Contract Types ──────────────────────────────────────────────────────────

/** Contract info as returned by GET /api/v1/contracts/{id} */
export interface ContractInfo {
  admin_key: Key | null;
  auto_renew_account: string | null;
  auto_renew_period: number | null;
  contract_id: string;
  created_timestamp: string;
  deleted: boolean;
  evm_address: string;
  expiry_timestamp: string | null;
  file_id: string | null;
  max_automatic_token_associations: number;
  memo: string;
  obtainer_id: string | null;
  permanent_removal: boolean | null;
  proxy_account_id: string | null;
  timestamp: { from: string; to: string | null };
}

/** Query parameters for listing contracts */
export interface ContractsQueryParams extends BaseQueryParams {
  'contract.id'?: string;
}

// ─── NFT Types ───────────────────────────────────────────────────────────────

/** NFT info as returned by the Mirror Node */
export interface NftInfo {
  account_id: string;
  created_timestamp: string;
  delegating_spender: string | null;
  deleted: boolean;
  metadata: string;
  modified_timestamp: string;
  serial_number: number;
  spender: string | null;
  token_id: string;
}

/** Query parameters for listing NFTs */
export interface NftsQueryParams extends BaseQueryParams {
  'account.id'?: string;
  serialnumber?: number;
}

// ─── Balance Types ───────────────────────────────────────────────────────────

/** Balance entry as returned by GET /api/v1/balances */
export interface BalanceEntry {
  account: string;
  balance: number;
  tokens: ReadonlyArray<TokenBalance>;
}

/** Query parameters for listing balances */
export interface BalancesQueryParams extends BaseQueryParams, TimestampFilter {
  'account.id'?: string;
  'account.balance'?: string;
  'account.publickey'?: string;
}

// ─── Block Types ─────────────────────────────────────────────────────────────

/** Block info as returned by GET /api/v1/blocks/{hashOrNumber} */
export interface BlockInfo {
  count: number;
  gas_used: number;
  hapi_version: string;
  hash: string;
  logs_bloom: string;
  name: string;
  number: number;
  previous_hash: string;
  size: number | null;
  timestamp: { from: string; to: string };
}

/** Query parameters for listing blocks */
export interface BlocksQueryParams extends BaseQueryParams {
  'block.number'?: string;
}

// ─── Schedule Types ──────────────────────────────────────────────────────────

/** Signature on a scheduled transaction */
export interface ScheduleSignature {
  consensus_timestamp: string;
  public_key_prefix: string;
  signature: string;
  type: string;
}

/** Schedule info as returned by GET /api/v1/schedules/{id} */
export interface ScheduleInfo {
  admin_key: Key | null;
  consensus_timestamp: string | null;
  creator_account_id: string;
  deleted: boolean;
  executed_timestamp: string | null;
  expiration_time: string | null;
  memo: string;
  payer_account_id: string;
  schedule_id: string;
  signatures: ReadonlyArray<ScheduleSignature>;
  transaction_body: string;
  wait_for_expiry: boolean;
}

/** Query parameters for listing schedules */
export interface SchedulesQueryParams extends BaseQueryParams {
  'account.id'?: string;
  'schedule.id'?: string;
  executed?: boolean;
}
