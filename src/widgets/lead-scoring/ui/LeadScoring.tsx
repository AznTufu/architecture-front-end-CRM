import { useMemo, useState } from 'react';
import { useActivitiesQuery } from '../../../entities/activity';
import { useContactsQuery } from '../../../entities/contact';
import { useDealsQuery } from '../../../entities/deal';
import { ContactDrawer } from '../../../features/view-contact-drawer';
import {
  selectGlobalSearchScope,
  selectGlobalSearchTerm,
  selectSelectedSavedView,
  useUiStore,
} from '../../../shared/store';

function daysSince(isoDate: string | null | undefined) {
  if (!isoDate) {
    return Number.POSITIVE_INFINITY;
  }

  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function LeadScoring() {
  const [scoreTier, setScoreTier] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const selectedSavedView = useUiStore(selectSelectedSavedView);
  const globalSearchTerm = useUiStore(selectGlobalSearchTerm);
  const globalSearchScope = useUiStore(selectGlobalSearchScope);
  const contactsQuery = useContactsQuery();
  const dealsQuery = useDealsQuery('all');
  const activitiesQuery = useActivitiesQuery();

  const scoredContacts = useMemo(() => {
    const contacts = contactsQuery.data ?? [];
    const deals = dealsQuery.data ?? [];
    const activities = activitiesQuery.data ?? [];

    const normalizedSearch = globalSearchTerm.toLowerCase();

    return contacts
      .map((contact) => {
        const statusScore =
          contact.status === 'opportunity'
            ? 45
            : contact.status === 'lead'
              ? 30
              : contact.status === 'customer'
                ? 10
                : 0;

        const relatedDeals = deals.filter((deal) => deal.contact_id === contact.id);
        const potentialAmount = relatedDeals.reduce((sum, deal) => sum + deal.amount, 0);
        const amountScore = Math.min(30, Math.round(potentialAmount / 500));

        const latestActivity = activities.find((activity) => activity.contact_id === contact.id);
        const days = daysSince(latestActivity?.created_at);
        const activityScore = days <= 7 ? 25 : days <= 30 ? 10 : 0;

        return {
          id: contact.id,
          name: contact.full_name,
          email: contact.email,
          company: contact.company ?? '',
          status: contact.status,
          statusScore,
          amountScore,
          activityScore,
          score: statusScore + amountScore + activityScore,
          potentialAmount,
          hasRecentActivity: days <= 14,
        };
      })
      .filter((lead) => {
        if (selectedSavedView === 'hot_prospects') {
          return (
            (lead.status === 'lead' || lead.status === 'opportunity') &&
            (lead.potentialAmount >= 5000 || lead.hasRecentActivity)
          );
        }

        if (selectedSavedView === 'deals_over_10k') {
          return lead.potentialAmount > 10000;
        }

        if (selectedSavedView === 'inactive_clients') {
          return lead.status === 'customer' && !lead.hasRecentActivity;
        }

        return true;
      })
      .filter((lead) => {
        if (!normalizedSearch) {
          return true;
        }

        if (globalSearchScope === 'deal') {
          return false;
        }

        if (globalSearchScope === 'company') {
          return lead.company.toLowerCase().includes(normalizedSearch);
        }

        return (
          lead.name.toLowerCase().includes(normalizedSearch) ||
          lead.email.toLowerCase().includes(normalizedSearch) ||
          lead.company.toLowerCase().includes(normalizedSearch)
        );
      })
      .filter((lead) => {
        if (scoreTier === 'high') {
          return lead.score >= 70;
        }

        if (scoreTier === 'medium') {
          return lead.score >= 40 && lead.score < 70;
        }

        if (scoreTier === 'low') {
          return lead.score < 40;
        }

        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [
    activitiesQuery.data,
    contactsQuery.data,
    dealsQuery.data,
    globalSearchScope,
    globalSearchTerm,
    scoreTier,
    selectedSavedView,
  ]);

  const selectedContact = scoredContacts.find((lead) => lead.id === selectedContactId) ?? null;
  const selectedContactDeals = selectedContact
    ? (dealsQuery.data ?? []).filter((deal) => deal.contact_id === selectedContact.id)
    : [];
  const selectedContactActivities = selectedContact
    ? (activitiesQuery.data ?? []).filter((activity) => activity.contact_id === selectedContact.id)
    : [];

  if (contactsQuery.isPending || dealsQuery.isPending || activitiesQuery.isPending) {
    return <section className="panel">Calcul du scoring...</section>;
  }

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <h2>Scoring prospect</h2>
          <div className="contact-filters">
            <select
              id="score-tier"
              aria-label="Filtre score"
              value={scoreTier}
              onChange={(event) =>
                setScoreTier(event.target.value as 'all' | 'high' | 'medium' | 'low')
              }
            >
              <option value="all">Tous</option>
              <option value="high">Eleve (&gt;= 70)</option>
              <option value="medium">Moyen (40 - 69)</option>
              <option value="low">Faible (&lt; 40)</option>
            </select>
          </div>
        </div>
        <ul className="contact-list">
          {scoredContacts.map((lead) => (
            <li
              key={lead.id}
              className="contact-card contact-card--interactive"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedContactId(lead.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedContactId(lead.id);
                }
              }}
            >
              <div>
                <h3>{lead.name}</h3>
                <p>{lead.status}</p>
              </div>
              <div className="contact-meta">
                <span>{new Intl.NumberFormat('fr-FR').format(lead.potentialAmount)} €</span>
                <span className="badge info">Score {lead.score}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {selectedContact ? (
        <ContactDrawer
          contact={{
            name: selectedContact.name,
            email: selectedContact.email,
            company: selectedContact.company,
            status: selectedContact.status,
            score: selectedContact.score,
            statusScore: selectedContact.statusScore,
            amountScore: selectedContact.amountScore,
            activityScore: selectedContact.activityScore,
            potentialAmount: selectedContact.potentialAmount,
          }}
          deals={selectedContactDeals}
          activities={selectedContactActivities}
          onClose={() => setSelectedContactId(null)}
        />
      ) : null}
    </>
  );
}
