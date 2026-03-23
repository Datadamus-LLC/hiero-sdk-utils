// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { MirrorNodeError, ValidationError } from '../../../src/errors/index.js';
import { TEST_CONFIG } from '../setup.js';

describe('ContractsResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should fetch a real contract from testnet', async () => {
    const contract = await client.contracts.getById(TEST_CONFIG.knownContractId);

    expect(contract).toHaveProperty('contract_id');
    expect(contract).toHaveProperty('evm_address');
    expect(typeof contract.contract_id).toBe('string');
    expect(contract.contract_id).toMatch(/^\d+\.\d+\.\d+$/);
    expect(contract.contract_id).toBe(TEST_CONFIG.knownContractId);
  });

  it('should throw ValidationError for invalid contract ID format', async () => {
    await expect(
      client.contracts.getById('not-a-contract'),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw MirrorNodeError for non-existent contract', async () => {
    await expect(
      client.contracts.getById('0.0.99999999999'),
    ).rejects.toThrow(MirrorNodeError);
  });

  it('should list real contracts from testnet', async () => {
    let count = 0;
    for await (const contract of client.contracts.list({ limit: 5 })) {
      expect(contract).toHaveProperty('contract_id');
      expect(typeof contract.contract_id).toBe('string');
      count++;
      if (count >= 5) break;
    }
    expect(count).toBe(5);
  });
});
