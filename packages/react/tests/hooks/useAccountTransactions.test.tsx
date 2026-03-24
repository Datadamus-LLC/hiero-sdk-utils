// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAccountTransactions } from '../../src/hooks/useAccountTransactions.js';
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

describe('useAccountTransactions', () => {
  const mockList = vi.fn();
  const wrapper = createWrapper({ transactions: { list: mockList } } as never);

  beforeEach(() => { vi.clearAllMocks(); });

  it('injects account.id into query params', async () => {
    mockList.mockReturnValue(makeAsyncIterable([]));
    renderHook(() => useAccountTransactions('0.0.1234'), { wrapper });
    await waitFor(() => expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ 'account.id': '0.0.1234' }),
    ));
  });

  it('does not fetch when accountId is null', () => {
    const { result } = renderHook(() => useAccountTransactions(null), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('returns error on failed fetch', async () => {
    mockList.mockReturnValue({
      [Symbol.asyncIterator]: () => ({
        next: () => Promise.reject(new Error('network error')),
      }),
    });
    const { result } = renderHook(() => useAccountTransactions('0.0.1234'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });
});
