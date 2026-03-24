// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useToken } from '../../src/hooks/useToken.js';
import { createWrapper } from '../helpers.js';

const mockToken = {
  token_id: '0.0.5678', name: 'Test Token', symbol: 'TEST',
  type: 'FUNGIBLE_COMMON', total_supply: '1000000', decimals: '6',
  admin_key: null, auto_renew_account: null, auto_renew_period: null,
  created_timestamp: '1234567890.000000000',
  custom_fees: {
    created_timestamp: '1234567890.000000000',
    fixed_fees: [], fractional_fees: [], royalty_fees: [],
  },
  deleted: false, expiry_timestamp: null, fee_schedule_key: null,
  freeze_default: false, freeze_key: null, initial_supply: '0',
  kyc_key: null, max_supply: '0', memo: '',
  modified_timestamp: '1234567890.000000000',
  pause_key: null, pause_status: 'NOT_APPLICABLE',
  supply_key: null, supply_type: 'INFINITE',
  treasury_account_id: '0.0.2', wipe_key: null,
};

describe('useToken', () => {
  const mockGetById = vi.fn();
  const wrapper = createWrapper({ tokens: { getById: mockGetById } } as never);

  beforeEach(() => { vi.clearAllMocks(); });

  it('returns data after successful fetch', async () => {
    mockGetById.mockResolvedValue(mockToken);
    const { result } = renderHook(() => useToken('0.0.5678'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockToken);
  });

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useToken(null), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(mockGetById).not.toHaveBeenCalled();
  });

  it('returns error on failed fetch', async () => {
    mockGetById.mockRejectedValue(new Error('not found'));
    const { result } = renderHook(() => useToken('0.0.5678'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });
});
