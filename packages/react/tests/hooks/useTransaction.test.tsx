// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTransaction } from '../../src/hooks/useTransaction.js';
import { createWrapper } from '../helpers.js';

const mockTx = {
  transaction_id: '0.0.1234-1234567890-000000001',
  consensus_timestamp: '1234567890.000000001',
  result: 'SUCCESS',
  name: 'CRYPTOTRANSFER',
  bytes: null, charged_tx_fee: 100, entity_id: null,
  max_fee: '200', memo_base64: '', nonce: 0,
  nft_transfers: [], node: null, parent_consensus_timestamp: null,
  scheduled: false, staking_reward_transfers: [],
  token_transfers: [], transaction_hash: 'abc',
  transfers: [], valid_duration_seconds: '120',
  valid_start_timestamp: '1234567890.000000000',
};

describe('useTransaction', () => {
  const mockGetById = vi.fn();
  const wrapper = createWrapper({ transactions: { getById: mockGetById } } as never);

  beforeEach(() => { vi.clearAllMocks(); });

  it('returns data after successful fetch', async () => {
    mockGetById.mockResolvedValue(mockTx);
    const { result } = renderHook(
      () => useTransaction('0.0.1234-1234567890-000000001'),
      { wrapper },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockTx);
    expect(result.current.error).toBeNull();
  });

  it('returns error on failed fetch', async () => {
    mockGetById.mockRejectedValue(new Error('not found'));
    const { result } = renderHook(
      () => useTransaction('0.0.1234-1234567890-000000001'),
      { wrapper },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useTransaction(null), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(mockGetById).not.toHaveBeenCalled();
  });
});
