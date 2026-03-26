import type { Contact } from '../model/schema';

interface ContactListProps {
  contacts: Contact[];
  onSelectContact?: (contactId: string) => void;
}

export function ContactList({ contacts, onSelectContact }: ContactListProps) {
  return (
    <ul className="contact-list">
      {contacts.map((contact) => (
        <li
          key={contact.id}
          className={`contact-card${onSelectContact ? ' contact-card--interactive' : ''}`}
          data-testid="contact-card"
          role={onSelectContact ? 'button' : undefined}
          tabIndex={onSelectContact ? 0 : undefined}
          onClick={onSelectContact ? () => onSelectContact(contact.id) : undefined}
          onKeyDown={
            onSelectContact
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectContact(contact.id);
                  }
                }
              : undefined
          }
        >
          <div>
            <h3>{contact.full_name}</h3>
            <p>{contact.email}</p>
            <p>{contact.phone}</p>
          </div>
          <div className="contact-meta">
            <span>{contact.company || 'Sans entreprise'}</span>
            <span className={`badge ${contact.status}`}>{contact.status}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
