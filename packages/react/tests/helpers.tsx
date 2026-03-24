// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import type { HieroClient } from 'hiero-sdk-utils';
import { HieroProvider } from '../src/HieroProvider.js';

/** Creates a renderHook wrapper that provides a mock HieroClient */
export function createWrapper(
  mockClient: Partial<HieroClient>,
): ({ children }: { children: React.ReactNode }) => JSX.Element {
  return function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <HieroProvider client={mockClient as HieroClient}>
        {children}
      </HieroProvider>
    );
  };
}
