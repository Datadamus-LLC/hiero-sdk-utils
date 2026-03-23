// SPDX-License-Identifier: Apache-2.0

/**
 * A simple token-bucket rate limiter that throttles requests
 * to stay within a specified requests-per-second limit.
 *
 * @example
 * ```ts
 * const limiter = new RateLimiter(10); // 10 req/s
 * await limiter.acquire(); // waits if needed
 * ```
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRateMs: number;

  /**
   * Creates a new rate limiter.
   *
   * @param maxRequestsPerSecond - Maximum number of requests allowed per second
   * @throws {Error} If maxRequestsPerSecond is not a positive number
   */
  constructor(maxRequestsPerSecond: number) {
    if (maxRequestsPerSecond <= 0) {
      throw new Error(
        `maxRequestsPerSecond must be positive, got ${maxRequestsPerSecond}`,
      );
    }
    this.maxTokens = maxRequestsPerSecond;
    this.tokens = maxRequestsPerSecond;
    this.lastRefill = Date.now();
    this.refillRateMs = 1000 / maxRequestsPerSecond;
  }

  /**
   * Acquires a token, waiting if necessary until one becomes available.
   * Call this before each HTTP request.
   *
   * @returns A promise that resolves when a token is acquired
   */
  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    const waitMs = this.refillRateMs - (Date.now() - this.lastRefill);
    if (waitMs > 0) {
      await this.sleep(waitMs);
    }

    this.refill();
    this.tokens = Math.max(0, this.tokens - 1);
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed / this.refillRateMs;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
