import { useMemo } from 'react';
import { useContactsQuery } from '../../../entities/contact';
import { dealStageSchema, useDealsQuery } from '../../../entities/deal';
import { selectSelectedSavedView, useUiStore } from '../../../shared/store';

const stageWinProbability = {
  prospecting: 0.1,
  qualification: 0.3,
  proposal: 0.55,
  negotiation: 0.75,
  closed_won: 1,
  closed_lost: 0,
} as const;

function widthFromCount(count: number, max: number) {
  if (max === 0) return '0%';
  return `${Math.round((count / max) * 100)}%`;
}

export function CrmMetrics() {
  const selectedSavedView = useUiStore(selectSelectedSavedView);
  const contactsQuery = useContactsQuery();
  const dealsQuery = useDealsQuery('all');

  const metrics = useMemo(() => {
    const allContacts = contactsQuery.data ?? [];
    const allDeals = dealsQuery.data ?? [];

    const contacts = allContacts.filter((contact) => {
      if (selectedSavedView === 'hot_prospects') {
        return contact.status === 'lead' || contact.status === 'opportunity';
      }

      if (selectedSavedView === 'inactive_clients') {
        return contact.status === 'customer';
      }

      if (selectedSavedView === 'deals_over_10k') {
        return allDeals.some(
          (deal) => deal.contact_id === contact.id && deal.amount > 10000
        );
      }

      return true;
    });

    const deals = allDeals.filter((deal) => {
      if (selectedSavedView === 'deals_over_10k') {
        return deal.amount > 10000;
      }

      if (selectedSavedView === 'hot_prospects') {
        return (
          deal.amount >= 5000 ||
          deal.stage === 'qualification' ||
          deal.stage === 'proposal' ||
          deal.stage === 'negotiation'
        );
      }

      return true;
    });

    const prospects = contacts.filter(
      (contact) => contact.status === 'lead' || contact.status === 'opportunity'
    ).length;
    const customers = contacts.filter((contact) => contact.status === 'customer').length;
    const won = deals.filter((deal) => deal.stage === 'closed_won').length;
    const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);

    const stageCounts = dealStageSchema.options.map((stage) => ({
      stage,
      count: deals.filter((deal) => deal.stage === stage).length,
    }));

    const statusCounts = [
      { label: 'prospects', count: prospects },
      { label: 'customers', count: customers },
      {
        label: 'blacklisted',
        count: contacts.filter((contact) => contact.status === 'blacklisted').length,
      },
    ];

    const maxStageCount = Math.max(...stageCounts.map((entry) => entry.count), 0);
    const maxStatusCount = Math.max(...statusCounts.map((entry) => entry.count), 0);
    const conversion =
      contacts.length === 0 ? 0 : Math.round((customers / contacts.length) * 100);
    const weightedForecast = deals.reduce(
      (sum, deal) => sum + deal.amount * stageWinProbability[deal.stage],
      0
    );

    return {
      contacts: contacts.length,
      prospects,
      won,
      conversion,
      totalAmount,
      weightedForecast,
      stageCounts,
      statusCounts,
      maxStageCount,
      maxStatusCount,
    };
  }, [contactsQuery.data, dealsQuery.data, selectedSavedView]);

  if (contactsQuery.isPending || dealsQuery.isPending) {
    return <section className="panel">Chargement des graphiques...</section>;
  }

  if (contactsQuery.isError) {
    return <section className="panel">Erreur graphiques: {contactsQuery.error.message}</section>;
  }

  if (dealsQuery.isError) {
    return <section className="panel">Erreur graphiques: {dealsQuery.error.message}</section>;
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Vue business</h2>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Contacts</span>
          <strong>{metrics.contacts}</strong>
        </article>
        <article className="kpi-card">
          <span>Prospects</span>
          <strong>{metrics.prospects}</strong>
        </article>
        <article className="kpi-card">
          <span>Deals gagnes</span>
          <strong>{metrics.won}</strong>
        </article>
        <article className="kpi-card">
          <span>Conversion</span>
          <strong>{metrics.conversion}%</strong>
        </article>
        <article className="kpi-card">
          <span>Prevision de revenus</span>
          <strong>{new Intl.NumberFormat('fr-FR').format(Math.round(metrics.weightedForecast))} €</strong>
          <small className="kpi-note">Impact: meilleure visibilite business</small>
        </article>
      </div>

      <div className="chart-grid">
        <article className="chart-card">
          <h3>Pipeline par etape</h3>
          <ul className="bars">
            {metrics.stageCounts.map((entry) => (
              <li key={entry.stage}>
                <span>{entry.stage}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: widthFromCount(entry.count, metrics.maxStageCount) }}
                  />
                </div>
                <strong>{entry.count}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="chart-card">
          <h3>Base contacts</h3>
          <ul className="bars">
            {metrics.statusCounts.map((entry) => (
              <li key={entry.label}>
                <span>{entry.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill neutral"
                    style={{ width: widthFromCount(entry.count, metrics.maxStatusCount) }}
                  />
                </div>
                <strong>{entry.count}</strong>
              </li>
            ))}
          </ul>
          <div className="chart-footer">
            <span>Volume opportunites total</span>
            <strong>{new Intl.NumberFormat('fr-FR').format(metrics.totalAmount)} €</strong>
          </div>
        </article>
      </div>
    </section>
  );
}
