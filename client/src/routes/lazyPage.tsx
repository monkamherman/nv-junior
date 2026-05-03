import LoaderPage from '@/layouts/loaders/LoaderPage';
import { lazy, Suspense, type ComponentType } from 'react';

export function lazyPage<T extends ComponentType<object>>(
  importer: () => Promise<{ default: T }>
) {
  const Page = lazy(importer);

  return (
    <Suspense fallback={<LoaderPage />}>
      <Page />
    </Suspense>
  );
}
