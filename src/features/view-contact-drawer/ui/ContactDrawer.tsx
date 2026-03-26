import type { Activity } from '../../../entities/activity';
import type { Deal } from '../../../entities/deal';

interface ContactDrawerProps {
  contact: {
    name: string;
    email: string;
    company: string;
    status: string;
    score?: number;
    statusScore?: number;
    amountScore?: number;
    activityScore?: number;
    potentialAmount: number;
  };
  deals: Deal[];
  activities: Activity[];
  onClose: () => void;
}

const activityLabel: Record<string, string> = {
  call: 'Appel',
  email: 'Email',
  meeting: 'Meeting',
  note: 'Note',
  task_reminder: 'Tache',
};

export function ContactDrawer({
  contact,
  deals,
  activities,
  onClose,
}: ContactDrawerProps) {
  const sortedDeals = [...deals].sort((a, b) => b.amount - a.amount);
  const sortedActivities = [...activities].sort((a, b) => {
    const left = a.created_at ? new Date(a.created_at).getTime() : 0;
    const right = b.created_at ? new Date(b.created_at).getTime() : 0;
    return right - left;
  });
  const initials = contact.name
    .split(' ')
    .map((word) => word.trim()[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="contact-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Fiche contact"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <h2>Fiche contact</h2>
          <button type="button" className="ghost-toggle" onClick={onClose}>
            Fermer
          </button>
        </div>

        <section className="contact-drawer__section">
          <div className="contact-identity">
            <div className="contact-identity__avatar">{initials || 'C'}</div>
            <div>
              <h3>{contact.name}</h3>
              <p className="meta">{contact.email}</p>
              <p className="meta">
                {contact.company || 'Sans entreprise'}
                <span className="badge info">{contact.status}</span>
              </p>
            </div>
          </div>
          {typeof contact.score === 'number' ? (
            <p className="meta">
              Score {contact.score} = statut {contact.statusScore ?? 0} + potentiel{' '}
              {contact.amountScore ?? 0} + activite {contact.activityScore ?? 0}
            </p>
          ) : null}
        </section>

        <section className="contact-drawer__section">
          <div className="panel-header">
            <h3>{sortedDeals.length} {sortedDeals.length > 1 ? 'deals' : 'deal'}</h3>
            <p className="meta">{new Intl.NumberFormat('fr-FR').format(contact.potentialAmount)} €</p>
          </div>
          <ul className="deal-list">
            {sortedDeals.map((deal) => (
              <li key={deal.id} className="deal-card">
                <p>{deal.title}</p>
                <strong>{new Intl.NumberFormat('fr-FR').format(deal.amount)} €</strong>
                <small>{deal.stage}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className="contact-drawer__section">
          <div className="panel-header">
            <h3>{sortedActivities.length} {sortedActivities.length > 1 ? 'activites' : 'activite'}</h3>
          </div>
          <ul className="timeline-list">
            {sortedActivities.map((activity) => (
              <li key={activity.id} className="timeline-item">
                <div className="timeline-item__dot" />
                <div>
                  <p className="timeline-item__title">
                    {activityLabel[activity.type] ?? activity.type} · {activity.title}
                  </p>
                  <p className="meta">
                    {activity.deal_title ? `${activity.deal_title} · ` : ''}
                    {activity.created_at
                      ? new Date(activity.created_at).toLocaleString('fr-FR')
                      : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
