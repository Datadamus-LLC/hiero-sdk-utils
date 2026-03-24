// SPDX-License-Identifier: Apache-2.0
/**
 * error-handling.ts — demonstrates typed errors from hiero-sdk-utils.
 *
 * Run: npx tsx error-handling.ts
 */

import {
  HieroClient,
  HieroError,
  Networks,
  ValidationError,
  MirrorNodeError,
} from 'hiero-sdk-utils';

const client = new HieroClient({
  baseUrl: Networks.testnet,
  maxRequestsPerSecond: 5,
});

async function main(): Promise<void> {
  // Example 1: ValidationError — caught before any network call
  console.log('Example 1: Invalid account ID format');
  try {
    await client.accounts.getById('not-a-valid-id');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log(`  Caught ValidationError`);
      console.log(`  Code:    ${error.code}`);
      console.log(`  Message: ${error.message}`);
    }
  }
  console.log();

  // Example 2: MirrorNodeError — account that does not exist on testnet
  console.log('Example 2: Account that does not exist (returns 404)');
  try {
    await client.accounts.getById('0.0.99999999999');
  } catch (error) {
    if (error instanceof MirrorNodeError) {
      console.log(`  Caught MirrorNodeError`);
      console.log(`  Status:  ${error.status}`);
      console.log(`  Code:    ${error.code}`);
      console.log(`  Message: ${error.message}`);
    }
  }
  console.log();

  // Example 3: HieroError base class — catch any library error
  console.log('Example 3: Catching any library error via HieroError base class');
  try {
    await client.tokens.getById('invalid-token-id');
  } catch (error) {
    if (error instanceof HieroError) {
      console.log(`  Caught ${error.name} (code: ${error.code})`);
    }
  }
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
