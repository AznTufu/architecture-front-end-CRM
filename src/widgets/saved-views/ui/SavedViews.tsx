import {
  selectSelectedSavedView,
  type SavedView,
  useUiStore,
} from '../../../shared/store';

const viewOptions: Array<{ value: SavedView; label: string }> = [
  { value: 'all', label: 'Vue standard' },
  { value: 'hot_prospects', label: 'Prospects chauds' },
  { value: 'deals_over_10k', label: 'Deals > 10k' },
  { value: 'inactive_clients', label: 'Clients inactifs' },
];

export function SavedViews() {
  const selectedView = useUiStore(selectSelectedSavedView);
  const setSelectedSavedView = useUiStore((state) => state.setSelectedSavedView);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Vues sauvegardees</h2>
      </div>
      <div className="saved-views-grid">
        {viewOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`saved-view-chip ${selectedView === option.value ? 'active' : ''}`}
            onClick={() => setSelectedSavedView(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
