// SPDX-License-Identifier: Apache-2.0

import type { HieroClientConfig } from './types.js';
import { RateLimiter } from './rateLimiter.js';
import { MirrorNodeError } from '../errors/index.js';
import { AccountsResource } from '../resources/accounts.js';
import { TransactionsResource } from '../resources/transactions.js';
import { TokensResource } from '../resources/tokens.js';
import { TopicsResource } from '../resources/topics.js';
import { ContractsResource } from '../resources/contracts.js';
import { NftsResource } from '../resources/nfts.js';
import { BalancesResource } from '../resources/balances.js';
import { BlocksResource } from '../resources/blocks.js';
import { SchedulesResource } from '../resources/schedules.js';

/** Retriable HTTP status codes */
const RETRIABLE_STATUSES = new Set([429, 503]);

/** Default configuration values */
const DEFAULTS = {
  maxRequestsPerSecond: 20,
  timeoutMs: 30_000,
  maxRetries: 3,
} as const;

/**
 * Core HTTP client for the Hedera Mirror Node REST API.
 * Provides typed access to all Mirror Node resources with automatic
 * rate limiting, retries, and error handling.
 *
 * @example
 * ```ts
 * import { HieroClient, Networks } from 'hiero-sdk-utils';
 *
 * const client = new HieroClient({ baseUrl: Networks.testnet });
 * const account = await client.accounts.getById('0.0.1234');
 * ```
 */
export class HieroClient {
  /** Base URL for the Mirror Node (no trailing slash) */
  public readonly baseUrl: string;

  private readonly fetchFn: typeof globalThis.fetch;
  private readonly rateLimiter: RateLimiter;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  /** Account-related Mirror Node queries */
  public readonly accounts: AccountsResource;
  /** Transaction-related Mirror Node queries */
  public readonly transactions: TransactionsResource;
  /** Token-related Mirror Node queries */
  public readonly tokens: TokensResource;
  /** Topic-related Mirror Node queries */
  public readonly topics: TopicsResource;
  /** Contract-related Mirror Node queries */
  public readonly contracts: ContractsResource;
  /** NFT-related Mirror Node queries */
  public readonly nfts: NftsResource;
  /** Balance-related Mirror Node queries */
  public readonly balances: BalancesResource;
  /** Block-related Mirror Node queries */
  public readonly blocks: BlocksResource;
  /** Schedule-related Mirror Node queries */
  public readonly schedules: SchedulesResource;

  /**
   * Creates a new HieroClient.
   *
   * @param config - Client configuration including base URL and optional overrides
   * @throws {Error} If baseUrl is empty
   */
  constructor(config: HieroClientConfig) {
    if (!config.baseUrl) {
      throw new Error('baseUrl is required and must not be empty');
    }

    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);
    this.rateLimiter = new RateLimiter(
      config.maxRequestsPerSecond ?? DEFAULTS.maxRequestsPerSecond,
    );
    this.defaultHeaders = {
      Accept: 'application/json',
      ...config.headers,
    };
    this.timeoutMs = config.timeoutMs ?? DEFAULTS.timeoutMs;
    this.maxRetries = config.maxRetries ?? DEFAULTS.maxRetries;

    this.accounts = new AccountsResource(this);
    this.transactions = new TransactionsResource(this);
    this.tokens = new TokensResource(this);
    this.topics = new TopicsResource(this);
    this.contracts = new ContractsResource(this);
    this.nfts = new NftsResource(this);
    this.balances = new BalancesResource(this);
    this.blocks = new BlocksResource(this);
    this.schedules = new SchedulesResource(this);
  }

  /**
   * Makes a GET request to the Mirror Node and returns typed JSON.
   * Handles rate limiting, retries on 429/503, and timeout.
   *
   * @param path - The API path (e.g., '/api/v1/accounts/0.0.2') or full next-page URL
   * @returns Parsed JSON response typed as T
   * @throws {MirrorNodeError} If the API returns a non-2xx response after retries
   */
  async get<T>(path: string): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      await this.rateLimiter.acquire();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchFn(url, {
          method: 'GET',
          headers: this.defaultHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const json: unknown = await response.json();
          return json as T;
        }

        if (RETRIABLE_STATUSES.has(response.status) && attempt < this.maxRetries) {
          const retryAfter = response.headers.get('Retry-After');
          const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000 * (attempt + 1);
          await this.sleep(waitMs);
          continue;
        }

        const errorBody = await this.safeReadBody(response);
        throw new MirrorNodeError(
          `Mirror Node returned ${response.status} for ${url}: ${errorBody}`,
          this.statusToCode(response.status),
          response.status,
        );
      } catch (error: unknown) {
        clearTimeout(timeoutId);

        if (error instanceof MirrorNodeError) {
          throw error;
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new MirrorNodeError(
            `Request timed out after ${this.timeoutMs}ms for ${url}`,
            'REQUEST_TIMEOUT',
            0,
            { cause: error },
          );
        }

        throw new MirrorNodeError(
          `Network error for ${url}: ${error instanceof Error ? error.message : String(error)}`,
          'NETWORK_ERROR',
          0,
          { cause: error instanceof Error ? error : new Error(String(error)) },
        );
      }
    }

    /* v8 ignore next -- unreachable: loop always exits via return or throw */
    throw new MirrorNodeError(`Request failed for ${url}`, 'MAX_RETRIES_EXCEEDED', 0);
  }

  private statusToCode(status: number): string {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 404: return 'NOT_FOUND';
      case 429: return 'RATE_LIMITED';
      case 503: return 'SERVICE_UNAVAILABLE';
      default: return 'MIRROR_NODE_ERROR';
    }
  }

  private async safeReadBody(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return text.substring(0, 500);
    } catch {
      return '(unable to read response body)';
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
