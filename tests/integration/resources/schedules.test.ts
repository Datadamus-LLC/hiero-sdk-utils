// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { HieroClient } from '../../../src/client/HieroClient.js';
import { MirrorNodeError, ValidationError } from '../../../src/errors/index.js';
import { TEST_CONFIG } from '../setup.js';

describe('SchedulesResource (integration)', () => {
  const client = new HieroClient({
    baseUrl: TEST_CONFIG.baseUrl,
    maxRequestsPerSecond: TEST_CONFIG.maxRequestsPerSecond,
  });

  it('should fetch a real schedule from testnet', async () => {
    const schedule = await client.schedules.getById(TEST_CONFIG.knownScheduleId);

    expect(schedule).toHaveProperty('schedule_id');
    expect(typeof schedule.schedule_id).toBe('string');
    expect(schedule.schedule_id).toMatch(/^\d+\.\d+\.\d+$/);
    expect(schedule.schedule_id).toBe(TEST_CONFIG.knownScheduleId);
  });

  it('should throw ValidationError for invalid schedule ID format', async () => {
    await expect(
      client.schedules.getById('not-a-schedule'),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw MirrorNodeError for non-existent schedule', async () => {
    await expect(
      client.schedules.getById('0.0.99999999999'),
    ).rejects.toThrow(MirrorNodeError);
  });

  it('should list real schedules from testnet', async () => {
    let count = 0;
    for await (const schedule of client.schedules.list({ limit: 5 })) {
      expect(schedule).toHaveProperty('schedule_id');
      expect(typeof schedule.schedule_id).toBe('string');
      count++;
      if (count >= 5) break;
    }
    expect(count).toBe(5);
  });
});
