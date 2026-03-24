// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAccount } from '../../src/hooks/useAccount.js';
import { createWrapper } from '../helpers.js';

const mockAccountInfo = {
  account: '0.0.1234',
  balance: { balance: 1000, timestamp: '1234567890.000000000', tokens: [] },
  alias: null, auto_renew_period: null, created_timestamp: null,
  decline_reward: false, deleted: false, ethereum_nonce: 0,
  evm_address: null, expiry_timestamp: null, key: null,
  max_automatic_token_associations: 0, memo: '', pending_reward: 0,
  receiver_sig_required: false, staked_account_id: null,
  staked_node_id: null, stake_period_start: null,
};

describe('useAccount', () => {
  const mockGetById = vi.fn();
  const wrapper = createWrapper({ accounts: { getById: mockGetById } } as never);

  beforeEach(() => { vi.clearAllMocks(); });

  it('returns loading:true initially when id is provided', () => {
    mockGetById.mockResolvedValue(mockAccountInfo);
    const { result } = renderHook(() => useAccount('0.0.1234'), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('returns data after successful fetch', async () => {
    mockGetById.mockResolvedValue(mockAccountInfo);
    const { result } = renderHook(() => useAccount('0.0.1234'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockAccountInfo);
    expect(result.current.error).toBeNull();
  });

  it('returns error on failed fetch', async () => {
    const err = new Error('not found');
    mockGetById.mockRejectedValue(err);
    const { result } = renderHook(() => useAccount('0.0.1234'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toEqual(err);
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useAccount(null), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockGetById).not.toHaveBeenCalled();
  });

  it('refetch triggers a second call', async () => {
    mockGetById.mockResolvedValue(mockAccountInfo);
    const { result } = renderHook(() => useAccount('0.0.1234'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.refetch();
    await waitFor(() => expect(mockGetById).toHaveBeenCalledTimes(2));
  });

  it('re-fetches when id changes', async () => {
    mockGetById.mockResolvedValue(mockAccountInfo);
    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useAccount(id),
      { wrapper, initialProps: { id: '0.0.1234' } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ id: '0.0.5678' });
    await waitFor(() => expect(mockGetById).toHaveBeenCalledTimes(2));
  });
});
