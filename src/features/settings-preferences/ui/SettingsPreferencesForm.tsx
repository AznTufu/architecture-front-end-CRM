import {
  selectSelectedSavedView,
  selectSelectedStage,
  useUiStore,
  type DealStageFilter,
  type SavedView,
} from '../../../shared/store';
import { savedViewOptions, stageOptions } from '../model/options';

export function SettingsPreferencesForm() {
  const selectedSavedView = useUiStore(selectSelectedSavedView);
  const selectedStage = useUiStore(selectSelectedStage);

  const setSelectedSavedView = useUiStore((state) => state.setSelectedSavedView);
  const setSelectedStage = useUiStore((state) => state.setSelectedStage);

  return (
    <section className="panel">
      <h2>Parametres CRM</h2>
      <p className="meta">Ces preferences sont sauvegardees localement</p>
      <form className="crm-form">
        <label>
          Vue sauvegardee par defaut
          <select
            value={selectedSavedView}
            onChange={(event) => setSelectedSavedView(event.target.value as SavedView)}
          >
            {savedViewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Filtre pipeline par defaut
          <select
            value={selectedStage}
            onChange={(event) => setSelectedStage(event.target.value as DealStageFilter)}
          >
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </form>
    </section>
  );
}
