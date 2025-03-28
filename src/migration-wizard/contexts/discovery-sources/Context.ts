import React from 'react';

export const Context = React.createContext<DiscoverySources.Context | null>(
  null,
);

export function useDiscoverySources(): DiscoverySources.Context {
  const ctx = React.useContext(Context);
  if (!ctx) {
    throw new Error(
      'useDiscoverySources must be used within a <DiscoverySourceProvider />',
    );
  }

  return ctx;
}
