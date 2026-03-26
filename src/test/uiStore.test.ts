import { beforeEach, describe, expect, it } from 'vitest';
import { selectSelectedStage, useUiStore } from '../shared/store';

describe('useUiStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useUiStore.setState((state) => ({
      ...state,
      selectedStage: 'all',
      dashboardContactStatus: 'all',
      contactsPageContactStatus: 'all',
    }));
  });

  it('calcule correctement le derived state et persiste le filtre', () => {
    expect(selectSelectedStage(useUiStore.getState())).toBe('all');

    useUiStore.getState().setSelectedStage('closed_won');

    expect(selectSelectedStage(useUiStore.getState())).toBe('closed_won');
    expect(localStorage.getItem('crm-ui-preferences')).toContain(
      '"selectedStage":"closed_won"'
    );
  });

  it('persiste le filtre prospects', () => {
    useUiStore.getState().setSelectedContactStatus('lead', 'dashboard');

    expect(localStorage.getItem('crm-ui-preferences')).toContain(
      '"dashboardContactStatus":"lead"'
    );
  });
});
