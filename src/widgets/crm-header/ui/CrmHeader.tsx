import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCompaniesQuery } from '../../../entities/company';
import { useContactsQuery } from '../../../entities/contact';
import { useDealsQuery } from '../../../entities/deal';
import { signOut, useSessionQuery } from '../../../shared/auth';
import type { SearchScope } from '../../../shared/store';
import { useUiStore } from '../../../shared/store';

export function CrmHeader() {
  const navigate = useNavigate();
  const { data: session } = useSessionQuery();
  const contactsQuery = useContactsQuery();
  const companiesQuery = useCompaniesQuery();
  const dealsQuery = useDealsQuery('all');
  const [search, setSearch] = useState('');
  const setGlobalSearch = useUiStore((state) => state.setGlobalSearch);
  const clearGlobalSearch = useUiStore((state) => state.clearGlobalSearch);
  const signOutMutation = useMutation({ mutationFn: signOut });

  const normalizedSearch = search.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedSearch) {
      return [] as Array<{
        id: string;
        label: string;
        query: string;
        kind: SearchScope;
      }>;
    }

    const contacts = (contactsQuery.data ?? [])
      .filter(
        (contact) =>
          contact.full_name.toLowerCase().includes(normalizedSearch) ||
          contact.email.toLowerCase().includes(normalizedSearch)
      )
      .map((contact) => ({
        id: contact.id,
        label: `${contact.full_name} · ${contact.email}`,
        query: `${contact.full_name} ${contact.email}`,
        kind: 'contact' as const,
      }));

    const companies = (companiesQuery.data ?? [])
      .filter(
        (company) =>
          company.name.toLowerCase().includes(normalizedSearch) ||
          (company.domain ?? '').toLowerCase().includes(normalizedSearch)
      )
      .map((company) => ({
        id: company.id,
        label: `${company.name} · ${company.domain ?? 'domaine non renseigne'}`,
        query: `${company.name} ${company.domain ?? ''}`,
        kind: 'company' as const,
      }));

    const deals = (dealsQuery.data ?? [])
      .filter((deal) => deal.title.toLowerCase().includes(normalizedSearch))
      .map((deal) => ({
        id: deal.id,
        label: `${deal.title} · ${new Intl.NumberFormat('fr-FR').format(deal.amount)} €`,
        query: deal.title,
        kind: 'deal' as const,
      }));

    return [...contacts, ...companies, ...deals].slice(0, 8);
  }, [companiesQuery.data, contactsQuery.data, dealsQuery.data, normalizedSearch]);

  const handleLogout = async () => {
    await signOutMutation.mutateAsync();
    navigate('/login', { replace: true });
  };

  const applySearchAndNavigate = (payload: { term: string; kind: SearchScope }) => {
    setGlobalSearch({ term: payload.term, scope: payload.kind });
    setSearch('');
    navigate(payload.kind === 'deal' ? '/' : '/contacts');
  };

  return (
    <header className="crm-header">
      <div className="crm-header__inner">
        <div className="crm-header__brand">
          <NavLink
            to="/"
            onClick={() => {
              clearGlobalSearch();
              setSearch('');
            }}
          >
            <h1>Pulse CRM</h1>
            <p>SaaS CRM en Feature Sliced Design</p>
          </NavLink>
        </div>

        <div className="crm-header__right">
          <div className="global-search">
            <input
              type="search"
              placeholder="contacts, entreprises, deals..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search ? (
              <button
                type="button"
                className="global-search__clear"
                onClick={() => {
                  setSearch('');
                  clearGlobalSearch();
                }}
              >
                ×
              </button>
            ) : null}
            {normalizedSearch ? (
              <ul className="search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <li key={`${result.kind}-${result.id}`}>
                      <button
                        type="button"
                        onClick={() =>
                          applySearchAndNavigate({
                            term: search.trim() || result.query,
                            kind: result.kind,
                          })
                        }
                      >
                        <span className="search-result-kind">{result.kind}</span>
                        <span>{result.label}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="search-results__empty">Aucun resultat</li>
                )}
              </ul>
            ) : null}
          </div>

          <nav className="crm-header__nav">
            <NavLink
              to="/"
              onClick={() => {
                clearGlobalSearch();
                setSearch('');
              }}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/contacts"
              onClick={() => {
                clearGlobalSearch();
                setSearch('');
              }}
            >
              Comptes et contacts
            </NavLink>
            <NavLink
              to="/deals"
              onClick={() => {
                clearGlobalSearch();
                setSearch('');
              }}
            >
              Deals
            </NavLink>
          </nav>

          <div className="crm-header__actions">
            <details className="settings-menu">
              <summary aria-label="Parametres">⚙</summary>
              <div className="settings-menu__panel">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                  }}
                >
                  Settings
                </button>
                <button type="button" onClick={handleLogout} disabled={signOutMutation.isPending}>
                  {signOutMutation.isPending ? 'Deconnexion...' : 'Se deconnecter'}
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
      <div className="crm-header__session">{session?.user.email ?? 'Utilisateur connecte'}</div>
    </header>
  );
}
