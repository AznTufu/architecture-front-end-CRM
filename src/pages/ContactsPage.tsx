import {
  selectGlobalSearchTerm,
  useUiStore,
} from '../shared/store';
import { useNavigate } from 'react-router-dom';
import { ContactsPanel } from '../widgets/contacts-panel';
import { CompaniesPanel } from '../widgets/companies-panel';
import { CrmHeader } from '../widgets/crm-header';

export function ContactsPage() {
  const navigate = useNavigate();
  const globalSearchTerm = useUiStore(selectGlobalSearchTerm);
  const clearGlobalSearch = useUiStore((state) => state.clearGlobalSearch);

  return (
    <div className="app-shell">
      <CrmHeader />
      <main className="main-layout single-column">
        <section className="panel inline-banner">
          <p className="meta m-0">Creer rapidement un nouveau contact.</p>
          <button
            type="button"
            className="ghost-toggle"
            onClick={() => navigate('/contacts/new')}
          >
            Nouveau contact
          </button>
        </section>
        {globalSearchTerm ? (
          <section className="panel inline-banner">
            <p className="meta">Recherche active: {globalSearchTerm}</p>
            <button type="button" className="ghost-toggle" onClick={clearGlobalSearch}>
              Effacer la recherche
            </button>
          </section>
        ) : null}
        <section className="base-crm-grid">
          <CompaniesPanel />
          <ContactsPanel context="contacts_page" />
        </section>
      </main>
    </div>
  );
}
