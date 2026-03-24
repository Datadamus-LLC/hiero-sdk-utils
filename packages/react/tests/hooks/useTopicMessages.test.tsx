// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTopicMessages } from '../../src/hooks/useTopicMessages.js';
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

const mockMessage = {
  topic_id: '0.0.7777', sequence_number: 1,
  consensus_timestamp: '1234567890.000000001',
  message: 'aGVsbG8=', payer_account_id: '0.0.1234',
  running_hash: 'abc', running_hash_version: 3, chunk_info: null,
};

describe('useTopicMessages', () => {
  const mockListMessages = vi.fn();
  const wrapper = createWrapper({ topics: { listMessages: mockListMessages } } as never);

  beforeEach(() => { vi.clearAllMocks(); });

  it('returns messages on success', async () => {
    mockListMessages.mockReturnValue(makeAsyncIterable([mockMessage]));
    const { result } = renderHook(() => useTopicMessages('0.0.7777'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([mockMessage]);
  });

  it('does not fetch when topicId is null', () => {
    const { result } = renderHook(() => useTopicMessages(null), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(mockListMessages).not.toHaveBeenCalled();
  });

  it('returns error on failed fetch', async () => {
    mockListMessages.mockReturnValue({
      [Symbol.asyncIterator]: () => ({
        next: () => Promise.reject(new Error('topic error')),
      }),
    });
    const { result } = renderHook(() => useTopicMessages('0.0.7777'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });
});
