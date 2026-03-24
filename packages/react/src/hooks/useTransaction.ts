// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import type { TransactionInfo } from 'hiero-sdk-utils';
import type { HieroQueryResult } from '../types.js';
import { useHieroClient } from '../HieroProvider.js';

/**
 * Fetches a single transaction by ID from the Hedera Mirror Node.
 *
 * @param transactionId - Transaction ID in `0.0.X-secs-nanos` format, or null to skip
 * @returns Query result with TransactionInfo data, loading state, and error
 *
 * @example
 * ```tsx
 * const { data } = useTransaction('0.0.1234-1234567890-000000001');
 * ```
 */
export function useTransaction(transactionId: string | null): HieroQueryResult<TransactionInfo> {
  const client = useHieroClient();
  const [data, setData] = useState<TransactionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback((): void => { setTick(t => t + 1); }, []);

  useEffect((): (() => void) => {
    if (transactionId === null) {
      setData(null);
      setLoading(false);
      setError(null);
      return (): void => { /* no cleanup needed */ };
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    client.transactions.getById(transactionId)
      .then((result): void => {
        if (!cancelled) { setData(result); setLoading(false); }
      })
      .catch((err: unknown): void => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return (): void => { cancelled = true; };
  }, [transactionId, client, tick]);

  return { data, loading, error, refetch };
}
