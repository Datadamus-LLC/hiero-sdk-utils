// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import type { AccountInfo } from 'hiero-sdk-utils';
import type { HieroQueryResult } from '../types.js';
import { useHieroClient } from '../HieroProvider.js';

/**
 * Fetches account information by ID from the Hedera Mirror Node.
 * Pass `null` to skip the fetch (e.g., when the ID is not yet known).
 *
 * @param accountId - Account in `0.0.X` format, or null to skip
 * @returns Query result with AccountInfo data, loading state, and error
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useAccount('0.0.1234');
 * ```
 */
export function useAccount(accountId: string | null): HieroQueryResult<AccountInfo> {
  const client = useHieroClient();
  const [data, setData] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback((): void => { setTick(t => t + 1); }, []);

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

    client.accounts.getById(accountId)
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
  }, [accountId, client, tick]);

  return { data, loading, error, refetch };
}
