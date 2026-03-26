import {
  selectContactsPageContactStatus,
  selectDashboardContactStatus,
  selectGlobalSearchScope,
  selectGlobalSearchTerm,
  selectSelectedSavedView,
  type ContactFilterContext,
  useUiStore,
} from '../../../shared/store';
import { useActivitiesQuery } from '../../../entities/activity';
import { ContactList, useContactsQuery } from '../../../entities/contact';
import { useDealsQuery } from '../../../entities/deal';
import { ContactFilters } from '../../../features/filter-contacts';
import { ContactDrawer } from '../../../features/view-contact-drawer';
import { useState } from 'react';

function isRecent(createdAt: string | null | undefined, days: number) {
  if (!createdAt) {
    return false;
  }

  const elapsedDays =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return elapsedDays <= days;
}

function includesAllTokens(haystack: string, term: string) {
  const tokens = term
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return true;
  }

  const normalizedHaystack = haystack.toLowerCase();
  return tokens.every((token) => normalizedHaystack.includes(token));
}

interface ContactsPanelProps {
  context: ContactFilterContext;
}

export function ContactsPanel({ context }: ContactsPanelProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const selectedStatus = useUiStore(
    context === 'dashboard'
      ? selectDashboardContactStatus
      : selectContactsPageContactStatus
  );
  const selectedSavedView = useUiStore(selectSelectedSavedView);
  const globalSearchTerm = useUiStore(selectGlobalSearchTerm);
  const globalSearchScope = useUiStore(selectGlobalSearchScope);
  const { data, isPending, isError, error } = useContactsQuery();
  const dealsQuery = useDealsQuery('all');
  const activitiesQuery = useActivitiesQuery();

  if (isPending || dealsQuery.isPending || activitiesQuery.isPending) {
    return <section className="panel">Chargement des contacts...</section>;
  }

  if (isError || dealsQuery.isError || activitiesQuery.isError) {
    const message =
      error?.message ?? dealsQuery.error?.message ?? activitiesQuery.error?.message ?? 'Erreur inconnue';
    return <section className="panel">Erreur contacts: {message}</section>;
  }

  const deals = dealsQuery.data;
  const activities = activitiesQuery.data;

  const statusFilteredContacts =
    selectedStatus === 'all'
      ? data
      : data.filter((contact) => contact.status === selectedStatus);

  const savedViewFilteredContacts = statusFilteredContacts.filter((contact) => {
    if (context !== 'dashboard') {
      return true;
    }

    if (selectedSavedView === 'hot_prospects') {
      if (!(contact.status === 'lead' || contact.status === 'opportunity')) {
        return false;
      }

      const potentialAmount = deals
        .filter((deal) => deal.contact_id === contact.id)
        .reduce((sum, deal) => sum + deal.amount, 0);
      const hasRecentActivity = activities.some(
        (activity) => activity.contact_id === contact.id && isRecent(activity.created_at, 14)
      );

      return potentialAmount >= 5000 || hasRecentActivity;
    }

    if (selectedSavedView === 'deals_over_10k') {
      return deals.some(
        (deal) => deal.contact_id === contact.id && deal.amount > 10000
      );
    }

    if (selectedSavedView === 'inactive_clients') {
      if (contact.status !== 'customer') {
        return false;
      }

      const hasRecentActivity = activities.some(
        (activity) => activity.contact_id === contact.id && isRecent(activity.created_at, 30)
      );
      return !hasRecentActivity;
    }

    return true;
  });

  const normalizedSearch = globalSearchTerm.toLowerCase();

  const filteredContacts = savedViewFilteredContacts.filter((contact) => {
    if (!normalizedSearch) {
      return true;
    }

    if (context !== 'contacts_page') {
      return true;
    }

    if (globalSearchScope === 'deal') {
      return false;
    }

    if (globalSearchScope === 'company') {
      return includesAllTokens(contact.company ?? '', normalizedSearch);
    }

    const combined = `${contact.full_name} ${contact.email} ${contact.company ?? ''}`;
    return (
      includesAllTokens(combined, normalizedSearch)
    );
  });

  const selectedContact =
    filteredContacts.find((contact) => contact.id === selectedContactId) ?? null;

  const selectedContactDeals = selectedContact
    ? deals.filter((deal) => deal.contact_id === selectedContact.id)
    : [];
  const selectedContactActivities = selectedContact
    ? activities.filter((activity) => activity.contact_id === selectedContact.id)
    : [];

  const selectedContactPotentialAmount = selectedContactDeals.reduce(
    (sum, deal) => sum + deal.amount,
    0
  );

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Contacts</h2>
        <ContactFilters context={context} />
      </div>
      <p className="meta">
        {context === 'contacts_page' && globalSearchTerm
          ? `Recherche active: ${filteredContacts.length} ${
              filteredContacts.length > 1 ? 'resultats' : 'resultat'
            }`
          : `${filteredContacts.length} ${
              filteredContacts.length > 1 ? 'resultats' : 'resultat'
            }`}
      </p>
      {filteredContacts.length > 0 ? (
        <ContactList
          contacts={filteredContacts}
          onSelectContact={(contactId) => setSelectedContactId(contactId)}
        />
      ) : (
        <p className="meta">
          Aucun contact visible. Verifie le filtre ou tes permissions d'acces.
        </p>
      )}

      {selectedContact ? (
        <ContactDrawer
          contact={{
            name: selectedContact.full_name,
            email: selectedContact.email,
            company: selectedContact.company ?? '',
            status: selectedContact.status,
            potentialAmount: selectedContactPotentialAmount,
          }}
          deals={selectedContactDeals}
          activities={selectedContactActivities}
          onClose={() => setSelectedContactId(null)}
        />
      ) : null}
    </section>
  );
}
