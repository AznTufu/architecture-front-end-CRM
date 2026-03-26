import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DealStageFilter =
  | 'all'
  | 'prospecting'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';
export type ContactStatusFilter =
  | 'all'
  | 'lead'
  | 'opportunity'
  | 'customer'
  | 'unqualified'
  | 'blacklisted';
export type ContactFilterContext = 'dashboard' | 'contacts_page';
export type SearchScope = 'all' | 'contact' | 'company' | 'deal';
export type SavedView =
  | 'all'
  | 'hot_prospects'
  | 'deals_over_10k'
  | 'inactive_clients';

interface UiState {
  selectedStage: DealStageFilter;
  dashboardContactStatus: ContactStatusFilter;
  contactsPageContactStatus: ContactStatusFilter;
  selectedSavedView: SavedView;
  globalSearchTerm: string;
  globalSearchScope: SearchScope;
  companiesPanelCollapsed: boolean;
  setSelectedStage: (stage: DealStageFilter) => void;
  setSelectedContactStatus: (
    status: ContactStatusFilter,
    context?: ContactFilterContext
  ) => void;
  setSelectedSavedView: (view: SavedView) => void;
  setGlobalSearch: (payload: { term: string; scope: SearchScope }) => void;
  clearGlobalSearch: () => void;
  setCompaniesPanelCollapsed: (collapsed: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      selectedStage: 'all',
      dashboardContactStatus: 'all',
      contactsPageContactStatus: 'all',
      selectedSavedView: 'all',
      globalSearchTerm: '',
      globalSearchScope: 'all',
      companiesPanelCollapsed: false,
      setSelectedStage: (stage) => set({ selectedStage: stage }),
      setSelectedContactStatus: (status, context = 'dashboard') =>
        set(
          context === 'dashboard'
            ? { dashboardContactStatus: status }
            : { contactsPageContactStatus: status }
        ),
      setSelectedSavedView: (view) => set({ selectedSavedView: view }),
      setGlobalSearch: ({ term, scope }) =>
        set({ globalSearchTerm: term.trim(), globalSearchScope: scope }),
      clearGlobalSearch: () => set({ globalSearchTerm: '', globalSearchScope: 'all' }),
      setCompaniesPanelCollapsed: (collapsed) =>
        set({ companiesPanelCollapsed: collapsed }),
    }),
    {
      name: 'crm-ui-preferences',
      partialize: (state) => ({
        selectedStage: state.selectedStage,
        dashboardContactStatus: state.dashboardContactStatus,
        contactsPageContactStatus: state.contactsPageContactStatus,
        selectedSavedView: state.selectedSavedView,
        globalSearchTerm: state.globalSearchTerm,
        globalSearchScope: state.globalSearchScope,
        companiesPanelCollapsed: state.companiesPanelCollapsed,
      }),
    }
  )
);

export const selectSelectedStage = (state: UiState) => state.selectedStage;
export const selectDashboardContactStatus = (state: UiState) =>
  state.dashboardContactStatus;
export const selectContactsPageContactStatus = (state: UiState) =>
  state.contactsPageContactStatus;
export const selectSelectedSavedView = (state: UiState) => state.selectedSavedView;
export const selectGlobalSearchTerm = (state: UiState) => state.globalSearchTerm;
export const selectGlobalSearchScope = (state: UiState) => state.globalSearchScope;
export const selectCompaniesPanelCollapsed = (state: UiState) =>
  state.companiesPanelCollapsed;
export const selectHasActiveGlobalSearch = (state: UiState) =>
  state.globalSearchTerm.trim().length > 0;
