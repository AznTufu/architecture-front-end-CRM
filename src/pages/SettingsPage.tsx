import { SettingsPreferencesForm } from '../features/settings-preferences';
import { CrmHeader } from '../widgets/crm-header';

export function SettingsPage() {
  return (
    <div className="app-shell">
      <CrmHeader />
      <main className="main-layout single-column">
        <SettingsPreferencesForm />
      </main>
    </div>
  );
}
