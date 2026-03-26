import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthSessionSync } from './AuthSessionSync';

const queryDefaults = {
  staleTime: 120_000,
  refetchOnWindowFocus: false,
  retry: 1,
} as const;

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: queryDefaults,
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionSync />
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}
