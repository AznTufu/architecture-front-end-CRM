import type { DealStageFilter, SavedView } from '../../../shared/store';

export const savedViewOptions: Array<{ value: SavedView; label: string }> = [
  { value: 'all', label: 'Toutes les vues' },
  { value: 'hot_prospects', label: 'Hot prospects' },
  { value: 'deals_over_10k', label: 'Deals > 10k' },
  { value: 'inactive_clients', label: 'Clients inactifs' },
];

export const stageOptions: Array<{ value: DealStageFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'prospecting', label: 'Lead' },
  { value: 'qualification', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Won' },
  { value: 'closed_lost', label: 'Lost' },
];
