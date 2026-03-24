// SPDX-License-Identifier: Apache-2.0

/**
 * hiero-sdk-utils-react — React hooks for the Hedera/Hiero Mirror Node.
 *
 * @example
 * ```tsx
 * import { HieroClient, Networks } from 'hiero-sdk-utils';
 * import { HieroProvider, useAccount } from 'hiero-sdk-utils-react';
 *
 * const client = new HieroClient({ baseUrl: Networks.mainnet });
 *
 * function App() {
 *   return (
 *     <HieroProvider client={client}>
 *       <AccountView />
 *     </HieroProvider>
 *   );
 * }
 *
 * function AccountView() {
 *   const { data, loading, error } = useAccount('0.0.1234');
 *   if (loading) return <span>Loading...</span>;
 *   if (error) return <span>Error: {error.message}</span>;
 *   return <span>{data?.balance.balance} tinybars</span>;
 * }
 * ```
 *
 * @packageDocumentation
 */

export { HieroProvider } from './HieroProvider.js';
export type { HieroProviderProps } from './HieroProvider.js';
export type { HieroQueryResult } from './types.js';

export { useAccount } from './hooks/useAccount.js';
export { useTransaction } from './hooks/useTransaction.js';
export { useToken } from './hooks/useToken.js';
export { useNFTs } from './hooks/useNFTs.js';
export { useAccountTransactions } from './hooks/useAccountTransactions.js';
export { useTopicMessages } from './hooks/useTopicMessages.js';
