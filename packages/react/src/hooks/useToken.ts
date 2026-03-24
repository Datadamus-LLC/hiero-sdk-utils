// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import type { TokenInfo } from 'hiero-sdk-utils';
import type { HieroQueryResult } from '../types.js';
import { useHieroClient } from '../HieroProvider.js';

/**
 * Fetches token information by ID from the Hedera Mirror Node.
 *
 * @param tokenId - Token in `0.0.X` format, or null to skip
 * @returns Query result with TokenInfo data, loading state, and error
 *
 * @example
 * ```tsx
 * const { data } = useToken('0.0.5678');
 * ```
 */
export function useToken(tokenId: string | null): HieroQueryResult<TokenInfo> {
  const client = useHieroClient();
  const [data, setData] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback((): void => { setTick(t => t + 1); }, []);

  useEffect((): (() => void) => {
    if (tokenId === null) {
      setData(null);
      setLoading(false);
      setError(null);
      return (): void => { /* no cleanup needed */ };
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    client.tokens.getById(tokenId)
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
  }, [tokenId, client, tick]);

  return { data, loading, error, refetch };
}
