import { Suspense } from 'react';
import { AppProviders } from './providers';
import { AppRouter } from './AppRouter';
import { ErrorBoundary } from './ErrorBoundary';

function App() {
  return (
    <AppProviders>
      <ErrorBoundary>
        <Suspense fallback={<main className="auth-page">Chargement...</main>}>
          <AppRouter />
        </Suspense>
      </ErrorBoundary>
    </AppProviders>
  );
}

export default App;
