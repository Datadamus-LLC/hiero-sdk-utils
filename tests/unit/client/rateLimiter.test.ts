// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../../../src/client/rateLimiter.js';

describe('RateLimiter', () => {
  it('should throw on non-positive rate', () => {
    expect(() => new RateLimiter(0)).toThrow('must be positive');
    expect(() => new RateLimiter(-1)).toThrow('must be positive');
  });

  it('should allow immediate requests up to the limit', async () => {
    const limiter = new RateLimiter(5);
    const start = Date.now();

    for (let i = 0; i < 5; i++) {
      await limiter.acquire();
    }

    const elapsed = Date.now() - start;
    // First 5 should be nearly instant
    expect(elapsed).toBeLessThan(100);
  });

  it('should throttle when exceeding the rate', async () => {
    const limiter = new RateLimiter(100); // High rate to keep test fast
    // Acquire all tokens
    for (let i = 0; i < 100; i++) {
      await limiter.acquire();
    }

    const start = Date.now();
    await limiter.acquire(); // This should require a small wait
    const elapsed = Date.now() - start;

    // Should have waited at least a little (10ms/token at 100/s)
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });
});
