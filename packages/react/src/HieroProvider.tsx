// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useContext } from 'react';
import type { HieroClient } from 'hiero-sdk-utils';

const HieroContext = createContext<HieroClient | null>(null);

/**
 * Props for the HieroProvider component.
 */
export interface HieroProviderProps {
  /** The HieroClient instance to provide to all descendant hooks */
  client: HieroClient;
  children: React.ReactNode;
}

/**
 * Provides a HieroClient instance to all descendant hooks.
 * Place this once at the root of your application.
 *
 * @example
 * ```tsx
 * const client = new HieroClient({ baseUrl: Networks.mainnet });
 *
 * <HieroProvider client={client}>
 *   <App />
 * </HieroProvider>
 * ```
 */
export function HieroProvider({ client, children }: HieroProviderProps): JSX.Element {
  return (
    <HieroContext.Provider value={client}>
      {children}
    </HieroContext.Provider>
  );
}

/**
 * Returns the HieroClient from the nearest HieroProvider.
 * Throws a clear error if called outside a HieroProvider.
 *
 * @internal
 */
export function useHieroClient(): HieroClient {
  const client = useContext(HieroContext);
  if (client === null) {
    throw new Error(
      'useHieroClient must be used within a HieroProvider. ' +
      'Wrap your component tree with <HieroProvider client={client}>.',
    );
  }
  return client;
}
