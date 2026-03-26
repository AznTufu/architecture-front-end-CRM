import { useActivitiesQuery } from '../../../entities/activity';
import { useContactsQuery } from '../../../entities/contact';
import { useDealsQuery } from '../../../entities/deal';
import { selectSelectedSavedView, useUiStore } from '../../../shared/store';

const activityLabel: Record<string, string> = {
  call: 'Appel',
  email: 'Email',
  meeting: 'Meeting',
  note: 'Note',
  task_reminder: 'Tache',
};

export function ActivityTimeline() {
  const selectedSavedView = useUiStore(selectSelectedSavedView);
  const { data, isPending, isError, error } = useActivitiesQuery();
  const contactsQuery = useContactsQuery();
  const dealsQuery = useDealsQuery('all');

  if (isPending || contactsQuery.isPending || dealsQuery.isPending) {
    return <section className="panel">Chargement de la timeline...</section>;
  }

  if (isError || contactsQuery.isError || dealsQuery.isError) {
    const message =
      error?.message ?? contactsQuery.error?.message ?? dealsQuery.error?.message ?? 'Erreur inconnue';
    return <section className="panel">Erreur timeline: {message}</section>;
  }

  const contacts = contactsQuery.data;
  const deals = dealsQuery.data;

  const filteredActivities = data
    .filter((activity) => Boolean(activity.deal_id))
    .filter((activity) => {
    if (selectedSavedView === 'hot_prospects') {
      return activity.type === 'call' || activity.type === 'email' || activity.type === 'meeting';
    }

    if (selectedSavedView === 'deals_over_10k') {
      return deals.some((deal) => deal.id === activity.deal_id && deal.amount > 10000);
    }

    if (selectedSavedView === 'inactive_clients') {
      return contacts.some(
        (contact) =>
          contact.id === activity.contact_id &&
          contact.status === 'customer' &&
          activity.type === 'task_reminder'
      );
    }

    return true;
  });

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Timeline activite contact</h2>
        <p className="meta">
          {filteredActivities.length}{' '}
          {filteredActivities.length > 1 ? 'evenements' : 'evenement'}
        </p>
      </div>
      <ul className="timeline-list">
        {filteredActivities.map((activity) => (
          <li key={activity.id} className="timeline-item">
            <div className="timeline-item__dot" />
            <div>
              <p className="timeline-item__title">
                {activityLabel[activity.type] ?? activity.type} · {activity.title}
              </p>
              <p className="meta">
                {activity.contact_name ?? 'Contact inconnu'}
                {activity.deal_title ? ` · ${activity.deal_title}` : ''}
                {activity.created_at
                  ? ` · ${new Date(activity.created_at).toLocaleString('fr-FR')}`
                  : ''}
              </p>
              {activity.description ? <p>{activity.description}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
