import {
  selectContactsPageContactStatus,
  selectDashboardContactStatus,
  useUiStore,
  type ContactFilterContext,
  type ContactStatusFilter,
} from '../../../shared/store';

export function useContactStatusFilter(
  context: ContactFilterContext
): [
  ContactStatusFilter,
  (status: ContactStatusFilter) => void,
] {
  const status = useUiStore(
    context === 'dashboard'
      ? selectDashboardContactStatus
      : selectContactsPageContactStatus
  );
  const setSelectedContactStatus = useUiStore(
    (state) => state.setSelectedContactStatus
  );

  return [status, (nextStatus) => setSelectedContactStatus(nextStatus, context)];
}
