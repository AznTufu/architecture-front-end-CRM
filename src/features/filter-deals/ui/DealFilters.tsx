import type { DealStageFilter } from '../../../shared/store';
import { useDealStageFilter } from '../model/useDealStageFilter';

const stageOptions: Array<{ value: DealStageFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'prospecting', label: 'Lead' },
  { value: 'qualification', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Won' },
  { value: 'closed_lost', label: 'Lost' },
];

export function DealFilters() {
  const [selectedStage, setSelectedStage] = useDealStageFilter();

  return (
    <div className="deal-filters">
      <select
        id="deal-stage-filter"
        aria-label="Filtre pipeline"
        value={selectedStage}
        onChange={(event) => setSelectedStage(event.target.value as DealStageFilter)}
      >
        {stageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
