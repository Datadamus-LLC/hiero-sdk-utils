// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test configuration.
 * Tests hit the real Hedera testnet Mirror Node — no mocks.
 */
export const TEST_CONFIG = {
  baseUrl: 'https://testnet.mirrornode.hedera.com',
  /** Well-known node account that always exists on testnet */
  knownAccountId: '0.0.2',
  /** Well-known contract that always exists on testnet */
  knownContractId: '0.0.1253',
  /** Well-known NFT token that has minted NFTs on testnet */
  knownNftTokenId: '0.0.8350416',
  /** Serial number of a known NFT on testnet */
  knownNftSerial: 1,
  /** Well-known topic that has submitted messages on testnet */
  knownTopicId: '0.0.7399331',
  /** Well-known schedule that exists on testnet */
  knownScheduleId: '0.0.1856',
  /** Rate limit for integration tests — be polite */
  maxRequestsPerSecond: 10,
  /** Timeout for individual requests */
  timeoutMs: 30000,
} as const;
