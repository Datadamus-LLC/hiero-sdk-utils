// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import type { ScheduleInfo, SchedulesQueryParams } from '../types/api.js';
import { paginate } from '../pagination/paginator.js';
import { ValidationError } from '../errors/index.js';
import { ENTITY_ID_PATTERN } from '../types/common.js';

/**
 * Provides access to Mirror Node schedule endpoints.
 *
 * @example
 * ```ts
 * const schedule = await client.schedules.getById('0.0.1234');
 * for await (const s of client.schedules.list()) {
 *   console.log(s.schedule_id);
 * }
 * ```
 */
export class SchedulesResource {
  constructor(private readonly client: HieroClient) {}

  /**
   * Retrieves a single schedule by ID.
   *
   * @param scheduleId - Schedule in `0.0.X` format
   * @returns The schedule info including signatures and execution status
   * @throws {ValidationError} If scheduleId format is invalid
   * @throws {MirrorNodeError} If the API request fails
   */
  async getById(scheduleId: string): Promise<ScheduleInfo> {
    this.validateScheduleId(scheduleId);
    return this.client.get<ScheduleInfo>(`/api/v1/schedules/${scheduleId}`);
  }

  /**
   * Lists schedules with optional filters. Returns an async iterable
   * that automatically handles pagination.
   *
   * @param params - Optional query parameters for filtering
   * @returns Async iterable of schedule info objects
   */
  list(params?: SchedulesQueryParams): AsyncIterable<ScheduleInfo> {
    return paginate<ScheduleInfo>(
      this.client,
      '/api/v1/schedules',
      'schedules',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  private validateScheduleId(id: string): void {
    if (!ENTITY_ID_PATTERN.test(id)) {
      throw new ValidationError(
        `Invalid schedule ID format: "${id}". Expected "shard.realm.num" format (e.g., "0.0.1234").`,
        'INVALID_SCHEDULE_ID',
      );
    }
  }
}
