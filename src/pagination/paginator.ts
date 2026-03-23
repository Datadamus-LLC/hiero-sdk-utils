// SPDX-License-Identifier: Apache-2.0

import type { HieroClient } from '../client/HieroClient.js';
import { PaginationError } from '../errors/index.js';

/**
 * Builds a query string from parameters.
 *
 * @param path - The base API path
 * @param params - Optional key-value query parameters
 * @returns The full path with query string appended
 */
function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) {
    return path;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Extracts the `links.next` value from a Mirror Node paginated response.
 *
 * @param body - The raw JSON response object
 * @returns The next page URL or null
 */
function extractNextLink(body: Record<string, unknown>): string | null {
  const links = body['links'];
  if (links !== null && typeof links === 'object' && !Array.isArray(links)) {
    const linksObj = links as Record<string, unknown>;
    const next = linksObj['next'];
    if (typeof next === 'string' && next.length > 0) {
      return next;
    }
  }
  return null;
}

/**
 * Creates an async generator that paginates through a Mirror Node list endpoint.
 * Follows the `links.next` field to automatically fetch subsequent pages.
 *
 * @param client - The HieroClient instance to use for HTTP requests
 * @param path - The API path for the list endpoint (e.g., '/api/v1/accounts')
 * @param dataKey - The key in the response object that contains the data array (e.g., 'accounts')
 * @param params - Optional query parameters for filtering/sorting
 * @returns An async generator that yields individual items of type T
 * @throws {PaginationError} If the response shape is unexpected
 *
 * @example
 * ```ts
 * for await (const account of paginate<AccountInfo>(client, '/api/v1/accounts', 'accounts')) {
 *   console.log(account.account);
 * }
 * ```
 */
export async function* paginate<T>(
  client: HieroClient,
  path: string,
  dataKey: string,
  params?: Record<string, string | number | boolean | undefined>,
): AsyncGenerator<T, void, undefined> {
  let url: string | null = buildUrl(path, params);

  while (url !== null) {
    const body: Record<string, unknown> = await client.get<Record<string, unknown>>(url);
    const items: unknown = body[dataKey];

    if (!Array.isArray(items)) {
      throw new PaginationError(
        `Expected array at key "${dataKey}" in response from ${url}, got ${typeof items}`,
        'INVALID_RESPONSE_SHAPE',
      );
    }

    for (const item of items) {
      yield item as T;
    }

    // If the page was empty, stop regardless of links
    if (items.length === 0) {
      break;
    }

    const nextLink: string | null = extractNextLink(body);

    if (nextLink === null) {
      url = null;
    } else if (nextLink.startsWith('http')) {
      url = nextLink;
    } else {
      // Relative URL from the Mirror Node
      url = nextLink.startsWith('/') ? nextLink : `/${nextLink}`;
    }
  }
}
