// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import type { NftInfo, NftsQueryParams } from 'hiero-sdk-utils';
import type { HieroQueryResult } from '../types.js';
import { useHieroClient } from '../HieroProvider.js';

/**
 * Hook-specific params: excludes serialnumber (use client.nfts.getByTokenAndSerial for that).
 */
type NftsHookParams = Omit<NftsQueryParams, 'serialnumber'>;

/**
 * Fetches the first page of NFTs for a token from the Hedera Mirror Node.
 * Default page size is 25. Pass `limit` in params to change.
 *
 * @param tokenId - Token in `0.0.X` format, or null to skip
 * @param params - Optional query parameters (excludes serialnumber)
 * @returns Query result with NftInfo array, loading state, and error
 *
 * @example
 * ```tsx
 * const { data: nfts } = useNFTs('0.0.5678', { limit: 10 });
 * ```
 */
export function useNFTs(
  tokenId: string | null,
  params?: NftsHookParams,
): HieroQueryResult<NftInfo[]> {
  const client = useHieroClient();
  const [data, setData] = useState<NftInfo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback((): void => { setTick(t => t + 1); }, []);

  const limit = params?.limit;

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

    const effectiveLimit = limit ?? 25;
    const paramsWithLimit: NftsHookParams = { ...params, limit: effectiveLimit };

    void (async (): Promise<void> => {
      const results: NftInfo[] = [];
      try {
        for await (const nft of client.nfts.listByToken(tokenId, paramsWithLimit)) {
          results.push(nft);
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
  }, [tokenId, limit, client, tick]);

  return { data, loading, error, refetch };
}
