// SPDX-License-Identifier: Apache-2.0

/**
 * Configuration for the HieroClient.
 */
export interface HieroClientConfig {
  /** The Mirror Node base URL (no trailing slash) */
  baseUrl: string;
  /** Maximum requests per second for rate limiting (default: 20) */
  maxRequestsPerSecond?: number;
  /** Custom fetch implementation — useful for testing */
  fetch?: typeof globalThis.fetch;
  /** Default headers to include in all requests */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Maximum number of retries for retriable errors (default: 3) */
  maxRetries?: number;
}

/** Pre-configured network endpoints for the Hedera Mirror Node */
export const Networks = {
  mainnet: 'https://mainnet.mirrornode.hedera.com',
  testnet: 'https://testnet.mirrornode.hedera.com',
  previewnet: 'https://previewnet.mirrornode.hedera.com',
} as const satisfies Record<string, string>;

/** Network name keys */
export type NetworkName = keyof typeof Networks;
