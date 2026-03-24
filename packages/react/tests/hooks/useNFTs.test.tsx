// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNFTs } from '../../src/hooks/useNFTs.js';
import { createWrapper } from '../helpers.js';

function makeAsyncIterable<T>(items: T[]): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator](): AsyncIterator<T> {
      let i = 0;
      return {
        next(): Promise<IteratorResult<T>> {
          return Promise.resolve(
            i < items.length
              ? { value: items[i++] as T, done: false }
              : { value: undefined as unknown as T, done: true },
          );
        },
      };
    },
  };
}

const mockNft = {
  token_id: '0.0.5678', serial_number: 1, account_id: '0.0.9999',
  created_timestamp: '1234567890.000000000', delegating_spender: null,
  deleted: false, metadata: '', modified_timestamp: '1234567890.000000000',
  spender: null,
};

describe('useNFTs', () => {
  const mockListByToken = vi.fn();
  const wrapper = createWrapper({ nfts: { listByToken: mockListByToken } } as never);

  beforeEach(() => { vi.clearAllMocks(); });

  it('returns array of NFTs on success', async () => {
    mockListByToken.mockReturnValue(makeAsyncIterable([mockNft]));
    const { result } = renderHook(() => useNFTs('0.0.5678'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([mockNft]);
  });

  it('does not fetch when tokenId is null', () => {
    const { result } = renderHook(() => useNFTs(null), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(mockListByToken).not.toHaveBeenCalled();
  });

  it('returns error on failed fetch', async () => {
    mockListByToken.mockReturnValue({
      [Symbol.asyncIterator]: () => ({
        next: () => Promise.reject(new Error('API error')),
      }),
    });
    const { result } = renderHook(() => useNFTs('0.0.5678'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });

  it('passes limit to core method', async () => {
    mockListByToken.mockReturnValue(makeAsyncIterable([]));
    renderHook(() => useNFTs('0.0.5678', { limit: 5 }), { wrapper });
    await waitFor(() => expect(mockListByToken).toHaveBeenCalledWith(
      '0.0.5678',
      expect.objectContaining({ limit: 5 }),
    ));
  });
});
