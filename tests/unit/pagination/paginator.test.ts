// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { paginate } from '../../../src/pagination/paginator.js';
import { PaginationError } from '../../../src/errors/index.js';
import { createSequentialMockFetch } from '../../fixtures/index.js';

describe('Paginator', () => {
  it('should yield items from a single page', async () => {
    const mockFetch = createSequentialMockFetch([
      {
        body: {
          accounts: [{ id: '1' }, { id: '2' }],
          links: { next: null },
        },
      },
    ]);

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: mockFetch });
    const items: Array<{ id: string }> = [];

    for await (const item of paginate<{ id: string }>(client, '/api/v1/accounts', 'accounts')) {
      items.push(item);
    }

    expect(items).toHaveLength(2);
    expect(items[0]?.id).toBe('1');
    expect(items[1]?.id).toBe('2');
  });

  it('should follow pagination links across multiple pages', async () => {
    const mockFetch = createSequentialMockFetch([
      {
        body: {
          accounts: [{ id: '1' }, { id: '2' }],
          links: { next: '/api/v1/accounts?limit=2&account.id=gt:0.0.2' },
        },
      },
      {
        body: {
          accounts: [{ id: '3' }],
          links: { next: null },
        },
      },
    ]);

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: mockFetch });
    const items: Array<{ id: string }> = [];

    for await (const item of paginate<{ id: string }>(client, '/api/v1/accounts', 'accounts')) {
      items.push(item);
    }

    expect(items).toHaveLength(3);
  });

  it('should handle empty first page', async () => {
    const mockFetch = createSequentialMockFetch([
      {
        body: {
          accounts: [],
          links: { next: null },
        },
      },
    ]);

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: mockFetch });
    const items: unknown[] = [];

    for await (const item of paginate(client, '/api/v1/accounts', 'accounts')) {
      items.push(item);
    }

    expect(items).toHaveLength(0);
  });

  it('should throw PaginationError on invalid response shape', async () => {
    const mockFetch = createSequentialMockFetch([
      {
        body: {
          wrong_key: [{ id: '1' }],
          links: { next: null },
        },
      },
    ]);

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: mockFetch });

    const iter = paginate(client, '/api/v1/accounts', 'accounts');
    await expect(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const item of iter) {
        // Should throw before yielding
      }
    }).rejects.toThrow(PaginationError);
  });

  it('should handle missing links field', async () => {
    const mockFetch = createSequentialMockFetch([
      {
        body: {
          accounts: [{ id: '1' }],
        },
      },
    ]);

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: mockFetch });
    const items: Array<{ id: string }> = [];

    for await (const item of paginate<{ id: string }>(client, '/api/v1/accounts', 'accounts')) {
      items.push(item);
    }

    expect(items).toHaveLength(1);
  });

  it('should handle absolute URL in links.next', async () => {
    const mockFetch = createSequentialMockFetch([
      {
        body: {
          accounts: [{ id: '1' }],
          links: { next: 'https://testnet.mirrornode.hedera.com/api/v1/accounts?limit=1&cursor=abc' },
        },
      },
      {
        body: {
          accounts: [{ id: '2' }],
          links: { next: null },
        },
      },
    ]);

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: mockFetch });
    const items: Array<{ id: string }> = [];

    for await (const item of paginate<{ id: string }>(client, '/api/v1/accounts', 'accounts')) {
      items.push(item);
    }

    expect(items).toHaveLength(2);
    expect(items[0]?.id).toBe('1');
    expect(items[1]?.id).toBe('2');
  });

  it('should handle relative links.next without leading slash', async () => {
    const mockFetch = createSequentialMockFetch([
      {
        body: {
          accounts: [{ id: '1' }],
          links: { next: 'api/v1/accounts?limit=1&cursor=abc' },
        },
      },
      {
        body: {
          accounts: [{ id: '2' }],
          links: { next: null },
        },
      },
    ]);

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: mockFetch });
    const items: Array<{ id: string }> = [];

    for await (const item of paginate<{ id: string }>(client, '/api/v1/accounts', 'accounts')) {
      items.push(item);
    }

    expect(items).toHaveLength(2);
  });

  it('should return bare path when all param values are undefined', async () => {
    let calledUrl = '';
    const trackingFetch = ((url: string) => {
      calledUrl = url;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ accounts: [], links: { next: null } }),
        text: () => Promise.resolve('{}'),
      });
    }) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: trackingFetch });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of paginate(client, '/api/v1/accounts', 'accounts', {
      limit: undefined,
      order: undefined,
    })) {
      // consume
    }

    expect(calledUrl).not.toContain('?');
  });

  it('should pass query parameters', async () => {
    let calledUrl = '';
    const trackingFetch = ((url: string) => {
      calledUrl = url;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ accounts: [], links: { next: null } }),
        text: () => Promise.resolve('{}'),
      });
    }) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({ baseUrl: Networks.testnet, fetch: trackingFetch });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const item of paginate(client, '/api/v1/accounts', 'accounts', {
      limit: 10,
      order: 'desc',
    })) {
      // consume — we're testing that URL params are passed correctly
    }

    expect(calledUrl).toContain('limit=10');
    expect(calledUrl).toContain('order=desc');
  });
});
