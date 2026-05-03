import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes/routes';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, lazy } from 'react';
import { RouterProvider } from 'react-router-dom';
import { PWAInstallButton } from './components/PWAInstallButton';
import { theme } from './theme';

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : null;

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <AuthProvider>
          <Notifications position="top-right" />
          <PWAInstallButton />
          <RouterProvider router={router} />
          <Toaster />
          {ReactQueryDevtools ? (
            <Suspense fallback={null}>
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
          ) : null}
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default App;
