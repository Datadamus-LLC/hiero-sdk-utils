// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { Networks } from '../../../src/client/types.js';
import { ValidationError } from '../../../src/errors/index.js';
import * as fixtures from '../../fixtures/index.js';

describe('SchedulesResource', () => {
  it('should fetch schedule by ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch(fixtures.scheduleInfo),
    });

    const schedule = await client.schedules.getById('0.0.9999');
    expect(schedule.schedule_id).toBe('0.0.9999');
  });

  it('should throw ValidationError for invalid schedule ID', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({}),
    });

    await expect(client.schedules.getById('bad')).rejects.toThrow(ValidationError);
  });

  it('should list schedules', async () => {
    const client = new HieroClient({
      baseUrl: Networks.testnet,
      fetch: fixtures.createMockFetch({
        schedules: [fixtures.scheduleInfo],
        links: { next: null },
      }),
    });

    const items: unknown[] = [];
    for await (const s of client.schedules.list()) {
      items.push(s);
    }
    expect(items).toHaveLength(1);
  });
});
