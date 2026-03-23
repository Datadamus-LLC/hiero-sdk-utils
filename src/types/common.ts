// SPDX-License-Identifier: Apache-2.0

/**
 * Regular expression pattern for validating Hedera entity IDs.
 * Format: `shard.realm.num` where each segment is a non-negative integer.
 *
 * @example
 * ```ts
 * ENTITY_ID_PATTERN.test('0.0.1234'); // true
 * ENTITY_ID_PATTERN.test('invalid');   // false
 * ```
 */
export const ENTITY_ID_PATTERN = /^\d+\.\d+\.\d+$/;

/**
 * Pagination links returned by the Mirror Node API.
 */
export interface PaginationLinks {
  /** URL for the next page of results, or null if no more pages */
  next: string | null;
}

/**
 * Generic paginated response shape from the Mirror Node API.
 * The data array is keyed by the resource name (e.g., 'accounts', 'transactions').
 */
export interface PaginatedResponse<T> {
  /** Pagination navigation links */
  links: PaginationLinks;
  /** Dynamic key containing the array of items */
  [key: string]: ReadonlyArray<T> | PaginationLinks | undefined;
}

/**
 * Common query parameters supported by most Mirror Node list endpoints.
 */
export interface BaseQueryParams {
  /** Maximum number of items per page (Mirror Node default is 25, max is 100) */
  limit?: number;
  /** Sort order: 'asc' or 'desc' */
  order?: 'asc' | 'desc';
}

/**
 * Timestamp filter used across many Mirror Node endpoints.
 * Values are in `seconds.nanoseconds` format.
 */
export interface TimestampFilter {
  /** Return results after this timestamp */
  'timestamp.gt'?: string;
  /** Return results at or after this timestamp */
  'timestamp.gte'?: string;
  /** Return results before this timestamp */
  'timestamp.lt'?: string;
  /** Return results at or before this timestamp */
  'timestamp.lte'?: string;
}
