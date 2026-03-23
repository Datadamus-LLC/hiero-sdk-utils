// SPDX-License-Identifier: Apache-2.0

/**
 * Test fixtures for unit tests. These simulate Mirror Node API responses.
 */

export const accountInfo = {
  account: '0.0.1234',
  alias: null,
  auto_renew_period: 7776000,
  balance: {
    balance: 100000000,
    timestamp: '1234567890.000000000',
    tokens: [],
  },
  created_timestamp: '1234567890.000000000',
  decline_reward: false,
  deleted: false,
  ethereum_nonce: 0,
  evm_address: '0x0000000000000000000000000000000000001234',
  expiry_timestamp: '9999999999.000000000',
  key: { _type: 'ED25519', key: 'abc123' },
  max_automatic_token_associations: 0,
  memo: '',
  pending_reward: 0,
  receiver_sig_required: false,
  staked_account_id: null,
  staked_node_id: null,
  stake_period_start: null,
};

export const accountsListPage1 = {
  accounts: [
    { ...accountInfo, account: '0.0.1' },
    { ...accountInfo, account: '0.0.2' },
    { ...accountInfo, account: '0.0.3' },
  ],
  links: { next: '/api/v1/accounts?limit=3&account.id=gt:0.0.3' },
};

export const accountsListPage2 = {
  accounts: [
    { ...accountInfo, account: '0.0.4' },
    { ...accountInfo, account: '0.0.5' },
  ],
  links: { next: null },
};

export const transactionInfo = {
  bytes: null,
  charged_tx_fee: 100000,
  consensus_timestamp: '1234567890.000000001',
  entity_id: '0.0.1234',
  max_fee: '200000',
  memo_base64: '',
  name: 'CRYPTOTRANSFER',
  nft_transfers: [],
  node: '0.0.3',
  nonce: 0,
  parent_consensus_timestamp: null,
  result: 'SUCCESS',
  scheduled: false,
  staking_reward_transfers: [],
  token_transfers: [],
  transaction_hash: 'abc123hash',
  transaction_id: '0.0.1234-1234567890-000000001',
  transfers: [
    { account: '0.0.1234', amount: -100, is_approval: false },
    { account: '0.0.5678', amount: 100, is_approval: false },
  ],
  valid_duration_seconds: '120',
  valid_start_timestamp: '1234567890.000000000',
};

export const tokenInfo = {
  admin_key: null,
  auto_renew_account: '0.0.1234',
  auto_renew_period: 7776000,
  created_timestamp: '1234567890.000000000',
  custom_fees: {
    created_timestamp: '1234567890.000000000',
    fixed_fees: [],
    fractional_fees: [],
    royalty_fees: [],
  },
  decimals: '8',
  deleted: false,
  expiry_timestamp: null,
  fee_schedule_key: null,
  freeze_default: false,
  freeze_key: null,
  initial_supply: '1000000',
  kyc_key: null,
  max_supply: '10000000',
  memo: 'Test token',
  modified_timestamp: '1234567890.000000000',
  name: 'TestToken',
  pause_key: null,
  pause_status: 'NOT_APPLICABLE',
  supply_key: null,
  supply_type: 'INFINITE',
  symbol: 'TT',
  token_id: '0.0.5678',
  total_supply: '1000000',
  treasury_account_id: '0.0.1234',
  type: 'FUNGIBLE_COMMON',
  wipe_key: null,
};

export const blockInfo = {
  count: 10,
  gas_used: 50000,
  hapi_version: '0.38.0',
  hash: '0xabc123def456',
  logs_bloom: '0x00',
  name: '2024-01-01T00_00_00.000000001Z.rcd.gz',
  number: 12345,
  previous_hash: '0xprevhash123',
  size: null,
  timestamp: { from: '1234567890.000000000', to: '1234567890.999999999' },
};

export const scheduleInfo = {
  admin_key: null,
  consensus_timestamp: '1234567890.000000000',
  creator_account_id: '0.0.1234',
  deleted: false,
  executed_timestamp: null,
  expiration_time: '9999999999.000000000',
  memo: 'test schedule',
  payer_account_id: '0.0.1234',
  schedule_id: '0.0.9999',
  signatures: [],
  transaction_body: 'base64body',
  wait_for_expiry: false,
};

export const topicInfo = {
  admin_key: null,
  auto_renew_account: null,
  auto_renew_period: 7776000,
  created_timestamp: '1234567890.000000000',
  deleted: false,
  memo: 'test topic',
  submit_key: null,
  timestamp: { from: '1234567890.000000000', to: null },
  topic_id: '0.0.7777',
};

export const contractInfo = {
  admin_key: null,
  auto_renew_account: null,
  auto_renew_period: 7776000,
  contract_id: '0.0.6666',
  created_timestamp: '1234567890.000000000',
  deleted: false,
  evm_address: '0x0000000000000000000000000000000000006666',
  expiry_timestamp: null,
  file_id: null,
  max_automatic_token_associations: 0,
  memo: '',
  obtainer_id: null,
  permanent_removal: null,
  proxy_account_id: null,
  timestamp: { from: '1234567890.000000000', to: null },
};

export const nftInfo = {
  account_id: '0.0.1234',
  created_timestamp: '1234567890.000000000',
  delegating_spender: null,
  deleted: false,
  metadata: 'base64metadata',
  modified_timestamp: '1234567890.000000000',
  serial_number: 1,
  spender: null,
  token_id: '0.0.5678',
};

/**
 * Helper to create a mock fetch function that returns a JSON response.
 *
 * @param body - The JSON body to return
 * @param status - HTTP status code (default: 200)
 * @returns A mock fetch function
 */
export function createMockFetch(
  body: unknown,
  status = 200,
): typeof globalThis.fetch {
  return (() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers(),
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    })) as unknown as typeof globalThis.fetch;
}

/**
 * Helper to create a mock fetch that returns different responses in sequence.
 *
 * @param responses - Array of response configs
 * @returns A mock fetch function
 */
export function createSequentialMockFetch(
  responses: Array<{ body: unknown; status?: number }>,
): typeof globalThis.fetch {
  let callIndex = 0;
  return (() => {
    const config = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    const status = config?.status ?? 200;
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers(),
      json: () => Promise.resolve(config?.body),
      text: () => Promise.resolve(JSON.stringify(config?.body)),
    });
  }) as unknown as typeof globalThis.fetch;
}
