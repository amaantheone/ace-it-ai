'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global SWR configuration
        refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
        dedupingInterval: 2000, // Dedupe requests within 2 seconds
        focusThrottleInterval: 5000, // Throttle revalidation on focus
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        // Keep previous data while fetching new data (prevents flash of loading)
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
