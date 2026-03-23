// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { ValidationError } from '../../../src/errors/index.js';
import * as fixtures from '../../fixtures/index.js';

describe('ContractsResource', () => {
  it('should fetch contract by ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch(fixtures.contractInfo),
    });

    const contract = await client.contracts.getById('0.0.6666');
    expect(contract.contract_id).toBe('0.0.6666');
  });

  it('should throw ValidationError for invalid contract ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.contracts.getById('bad')).rejects.toThrow(ValidationError);
  });

  it('should list contracts', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({
        contracts: [fixtures.contractInfo],
        links: { next: null },
      }),
    });

    const items: unknown[] = [];
    for await (const c of client.contracts.list()) {
      items.push(c);
    }
    expect(items).toHaveLength(1);
  });
});
