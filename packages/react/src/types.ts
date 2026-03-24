// SPDX-License-Identifier: Apache-2.0

/**
 * Return shape for all Hiero query hooks.
 *
 * @typeParam T - The data type returned by the query
 */
export interface HieroQueryResult<T> {
  /** The fetched data, or null while loading or on error */
  data: T | null;
  /** True while a network request is in flight */
  loading: boolean;
  /** The error thrown by the last failed request, or null */
  error: Error | null;
  /** Re-triggers the query without changing parameters */
  refetch: () => void;
}
