import { useCompaniesQuery } from '../../../entities/company';
import {
  selectCompaniesPanelCollapsed,
  useUiStore,
} from '../../../shared/store';

export function CompaniesPanel() {
  const { data, isPending, isError, error } = useCompaniesQuery();
  const collapsed = useUiStore(selectCompaniesPanelCollapsed);
  const setCollapsed = useUiStore((state) => state.setCompaniesPanelCollapsed);

  if (isPending) {
    return <section className="panel">Chargement des entreprises...</section>;
  }

  if (isError) {
    return <section className="panel">Erreur entreprises: {error.message}</section>;
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Entreprises</h2>
        <div className="panel-header__actions">
          <p className="meta">
            {data.length} {data.length > 1 ? 'entreprises' : 'entreprise'}
          </p>
          <button
            type="button"
            className="ghost-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Deplier' : 'Plier'}
          </button>
        </div>
      </div>

      {!collapsed ? (
        <ul className="contact-list">
          {data.map((company) => (
            <li key={company.id} className="contact-card">
              <div>
                <h3>{company.name}</h3>
                <p>{company.domain || 'Domaine non renseigne'}</p>
              </div>
              <div className="contact-meta">
                <span>
                  {company.created_at
                    ? new Date(company.created_at).toLocaleDateString('fr-FR')
                    : '-'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
