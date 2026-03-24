// SPDX-License-Identifier: Apache-2.0
/**
 * pagination.ts — iterate through paginated results using for-await-of.
 *
 * Run: npx tsx pagination.ts
 */

import { HieroClient, Networks } from 'hiero-sdk-utils';

const client = new HieroClient({
  baseUrl: Networks.testnet,
  maxRequestsPerSecond: 5,
});

async function main(): Promise<void> {
  console.log('Fetching 15 accounts across multiple pages (limit: 5 per page)...');

  let count = 0;
  for await (const account of client.accounts.list({ limit: 5, order: 'asc' })) {
    count++;
    console.log(`  ${count}. ${account.account} — ${account.balance.balance} tinybars`);
    if (count >= 15) break; // stop after 15 items (3 pages)
  }

  console.log(`\nFetched ${count} accounts total.`);
  console.log();

  // Pagination also works for transactions, tokens, and all other list endpoints
  console.log('Fetching 10 recent transactions (limit: 5 per page)...');
  count = 0;
  for await (const tx of client.transactions.list({ limit: 5, order: 'desc' })) {
    count++;
    console.log(`  ${count}. ${tx.transaction_id} — ${tx.name} — ${tx.result}`);
    if (count >= 10) break;
  }

  console.log(`\nFetched ${count} transactions total.`);
}

main().catch((err: unknown) => {
  console.error('Error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
