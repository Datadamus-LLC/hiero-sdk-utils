// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import type { TopicMessage, TopicMessagesQueryParams } from 'hiero-sdk-utils';
import type { HieroQueryResult } from '../types.js';
import { useHieroClient } from '../HieroProvider.js';

/**
 * Fetches the first page of HCS messages for a topic from the Hedera Mirror Node.
 *
 * @param topicId - Topic in `0.0.X` format, or null to skip
 * @param params - Optional query parameters for filtering
 * @returns Query result with TopicMessage array, loading state, and error
 *
 * @example
 * ```tsx
 * const { data: messages } = useTopicMessages('0.0.7777', { limit: 20 });
 * ```
 */
export function useTopicMessages(
  topicId: string | null,
  params?: TopicMessagesQueryParams,
): HieroQueryResult<TopicMessage[]> {
  const client = useHieroClient();
  const [data, setData] = useState<TopicMessage[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback((): void => { setTick(t => t + 1); }, []);

  const limit = params?.limit;

  useEffect((): (() => void) => {
    if (topicId === null) {
      setData(null);
      setLoading(false);
      setError(null);
      return (): void => { /* no cleanup needed */ };
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const effectiveLimit = limit ?? 25;
    const paramsWithLimit: TopicMessagesQueryParams = { ...params, limit: effectiveLimit };

    void (async (): Promise<void> => {
      const results: TopicMessage[] = [];
      try {
        for await (const msg of client.topics.listMessages(topicId, paramsWithLimit)) {
          results.push(msg);
          if (results.length >= effectiveLimit) break;
        }
        if (!cancelled) { setData(results); setLoading(false); }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    })();

    return (): void => { cancelled = true; };
    // Only limit is tracked from params — not the full object — to avoid re-render
    // loops when callers pass inline objects. Other param changes need a new hook call.
  }, [topicId, limit, client, tick]);

  return { data, loading, error, refetch };
}
