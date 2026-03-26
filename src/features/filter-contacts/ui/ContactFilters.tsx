import type { ContactFilterContext, ContactStatusFilter } from '../../../shared/store';
import { useContactStatusFilter } from '../model/useContactStatusFilter';

const statusOptions: ContactStatusFilter[] = [
  'all',
  'lead',
  'opportunity',
  'customer',
  'unqualified',
  'blacklisted',
];

interface ContactFiltersProps {
  context: ContactFilterContext;
}

export function ContactFilters({ context }: ContactFiltersProps) {
  const [selectedStatus, setSelectedStatus] = useContactStatusFilter(context);

  return (
    <div className="contact-filters">
      <select
        id="contact-status-filter"
        aria-label="Filtre prospects"
        value={selectedStatus}
        onChange={(event) =>
          setSelectedStatus(event.target.value as ContactStatusFilter)
        }
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
