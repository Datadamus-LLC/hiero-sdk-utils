// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { MirrorNodeError } from '../../../src/errors/index.js';
import { createMockFetch } from '../../fixtures/index.js';

describe('HieroClient', () => {
  it('should create client with testnet URL', () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: createMockFetch({}),
    });
    expect(client.baseUrl).toBe('https://testnet.mirrornode.hedera.com');
  });

  it('should strip trailing slashes from baseUrl', () => {
    const client = new HieroClient({
      baseUrl: 'https://example.com///',
      fetch: createMockFetch({}),
    });
    expect(client.baseUrl).toBe('https://example.com');
  });

  it('should throw if baseUrl is empty', () => {
    expect(() => new HieroClient({ baseUrl: '' })).toThrow('baseUrl is required');
  });

  it('should make GET request and return typed JSON', async () => {
    const data = { account: '0.0.2', balance: { balance: 100, timestamp: '123', tokens: [] } };
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: createMockFetch(data),
    });

    const result = await client.get<typeof data>('/api/v1/accounts/0.0.2');
    expect(result.account).toBe('0.0.2');
  });

  it('should throw MirrorNodeError on 404', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: createMockFetch({ _status: { messages: [{ message: 'Not found' }] } }, 404),
      maxRetries: 0,
    });

    await expect(client.get('/api/v1/accounts/0.0.99999'))
      .rejects.toThrow(MirrorNodeError);

    try {
      await client.get('/api/v1/accounts/0.0.99999');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(MirrorNodeError);
      const error = e as MirrorNodeError;
      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    }
  });

  it('should throw MirrorNodeError on network error', async () => {
    const failFetch = (() =>
      Promise.reject(new Error('ECONNREFUSED'))) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: failFetch,
      maxRetries: 0,
    });

    await expect(client.get('/api/v1/accounts/0.0.2'))
      .rejects.toThrow(MirrorNodeError);
  });

  it('should expose resource namespaces', () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: createMockFetch({}),
    });
    expect(client.accounts).toBeDefined();
    expect(client.transactions).toBeDefined();
    expect(client.tokens).toBeDefined();
    expect(client.topics).toBeDefined();
    expect(client.contracts).toBeDefined();
    expect(client.nfts).toBeDefined();
    expect(client.balances).toBeDefined();
    expect(client.blocks).toBeDefined();
    expect(client.schedules).toBeDefined();
  });

  it('should throw MAX_RETRIES_EXCEEDED when all retry attempts fail', async () => {
    const alwaysRateLimited = (() =>
      Promise.resolve({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '0' }),
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('rate limited'),
      })) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: alwaysRateLimited,
      maxRetries: 2,
    });

    await expect(client.get('/test')).rejects.toThrow(MirrorNodeError);
    try {
      await client.get('/test');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(MirrorNodeError);
      const err = e as MirrorNodeError;
      expect(err.code).toBe('RATE_LIMITED');
    }
  });

  it('should wrap non-Error network failures', async () => {
    const weirdFetch = (() =>
      Promise.reject('string error')) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: weirdFetch,
      maxRetries: 0,
    });

    const err = await client.get('/test').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(MirrorNodeError);
    expect((err as MirrorNodeError).code).toBe('NETWORK_ERROR');
  });

  it('should throw REQUEST_TIMEOUT on AbortError', async () => {
    const abortingFetch = (() => {
      const abort = new DOMException('The operation was aborted', 'AbortError');
      return Promise.reject(abort);
    }) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: abortingFetch,
      maxRetries: 0,
      timeoutMs: 1,
    });

    const err = await client.get('/test').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(MirrorNodeError);
    expect((err as MirrorNodeError).code).toBe('REQUEST_TIMEOUT');
  });

  it('should handle unreadable error response body gracefully', async () => {
    const brokenBodyFetch = (() =>
      Promise.resolve({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: () => Promise.resolve({}),
        text: () => Promise.reject(new Error('stream destroyed')),
      })) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: brokenBodyFetch,
      maxRetries: 0,
    });

    const err = await client.get('/test').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(MirrorNodeError);
    expect((err as MirrorNodeError).message).toContain('unable to read response body');
  });

  it('should retry on 429 using Retry-After header', async () => {
    let callCount = 0;
    const retryFetch = (() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Headers({ 'Retry-After': '0' }),
          json: () => Promise.resolve({}),
          text: () => Promise.resolve('rate limited'),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'ok' }),
        text: () => Promise.resolve('{"data":"ok"}'),
      });
    }) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: retryFetch,
      maxRetries: 3,
    });

    const result = await client.get<{ data: string }>('/test');
    expect(result.data).toBe('ok');
    expect(callCount).toBe(2);
  });

  it('should retry on 503 without Retry-After header using backoff', async () => {
    let callCount = 0;
    const retryFetch = (() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 503,
          headers: new Headers(), // no Retry-After
          json: () => Promise.resolve({}),
          text: () => Promise.resolve('unavailable'),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'ok' }),
        text: () => Promise.resolve('{"data":"ok"}'),
      });
    }) as unknown as typeof globalThis.fetch;

    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: retryFetch,
      maxRetries: 3,
    });

    const result = await client.get<{ data: string }>('/test');
    expect(result.data).toBe('ok');
    expect(callCount).toBe(2);
  });
});
