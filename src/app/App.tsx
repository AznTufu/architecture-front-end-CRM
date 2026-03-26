import { AppProviders } from './providers';
import { AppRouter } from './AppRouter';

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
