// SPDX-License-Identifier: Apache-2.0
/**
 * basic-queries.ts — fetch a single account, token, and transaction by ID.
 *
 * Run: npx tsx basic-queries.ts
 */

import { HieroClient, Networks } from 'hiero-sdk-utils';

const client = new HieroClient({
  baseUrl: Networks.testnet,
  maxRequestsPerSecond: 5,
});

async function main(): Promise<void> {
  // Fetch account 0.0.2 (a well-known testnet node account)
  console.log('Fetching account 0.0.2...');
  const account = await client.accounts.getById('0.0.2');
  console.log(`  Account:  ${account.account}`);
  console.log(`  Balance:  ${account.balance.balance} tinybars`);
  console.log(`  Key type: ${account.key?._type ?? 'none'}`);
  console.log();

  // Fetch a fungible token
  console.log('Fetching token 0.0.1189335...');
  try {
    const token = await client.tokens.getById('0.0.1189335');
    console.log(`  Name:         ${token.name}`);
    console.log(`  Symbol:       ${token.symbol}`);
    console.log(`  Type:         ${token.type}`);
    console.log(`  Total supply: ${token.total_supply}`);
  } catch {
    // Fall back to listing the first available token
    for await (const token of client.tokens.list({ limit: 1, order: 'asc' })) {
      console.log(`  Name:         ${token.name}`);
      console.log(`  Token ID:     ${token.token_id}`);
      break;
    }
  }
  console.log();

  // List the most recent transaction to get a real ID
  console.log('Fetching most recent transaction...');
  for await (const tx of client.transactions.list({ limit: 1, order: 'desc' })) {
    console.log(`  Transaction ID: ${tx.transaction_id}`);
    console.log(`  Type:           ${tx.name}`);
    console.log(`  Result:         ${tx.result}`);
    console.log(`  Timestamp:      ${tx.consensus_timestamp}`);
    break;
  }
}

main().catch((err: unknown) => {
  console.error('Error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
