// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import type { TransactionInfo, TransactionsQueryParams } from 'hiero-sdk-utils';
import type { HieroQueryResult } from '../types.js';
import { useHieroClient } from '../HieroProvider.js';

/**
 * Fetches the first page of transactions for an account from the Hedera Mirror Node.
 * The accountId is injected as `account.id` in the query params automatically.
 *
 * @param accountId - Account in `0.0.X` format, or null to skip
 * @param params - Optional query parameters for filtering
 * @returns Query result with TransactionInfo array, loading state, and error
 *
 * @example
 * ```tsx
 * const { data: txs } = useAccountTransactions('0.0.1234', { limit: 10 });
 * ```
 */
export function useAccountTransactions(
  accountId: string | null,
  params?: TransactionsQueryParams,
): HieroQueryResult<TransactionInfo[]> {
  const client = useHieroClient();
  const [data, setData] = useState<TransactionInfo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback((): void => { setTick(t => t + 1); }, []);

  const limit = params?.limit;

  useEffect((): (() => void) => {
    if (accountId === null) {
      setData(null);
      setLoading(false);
      setError(null);
      return (): void => { /* no cleanup needed */ };
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const effectiveLimit = limit ?? 25;
    const paramsWithLimit: TransactionsQueryParams = {
      ...params,
      'account.id': accountId,
      limit: effectiveLimit,
    };

    void (async (): Promise<void> => {
      const results: TransactionInfo[] = [];
      try {
        for await (const tx of client.transactions.list(paramsWithLimit)) {
          results.push(tx);
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
  }, [accountId, limit, client, tick]);

  return { data, loading, error, refetch };
}
