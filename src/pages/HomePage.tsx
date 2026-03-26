import { useEffect } from 'react';
import { useUiStore } from '../shared/store';
import { ActivityTimeline } from '../widgets/activity-timeline';
import { ContactsPanel } from '../widgets/contacts-panel';
import { CrmHeader } from '../widgets/crm-header';
import { DealsBoard } from '../widgets/deals-board';
import { CrmMetrics } from '../widgets/crm-metrics';
import { LeadScoring } from '../widgets/lead-scoring';
import { SavedViews } from '../widgets/saved-views';

export function HomePage() {
  const clearGlobalSearch = useUiStore((state) => state.clearGlobalSearch);

  useEffect(() => {
    clearGlobalSearch();
  }, [clearGlobalSearch]);

  return (
    <div className="app-shell">
      <CrmHeader />
      <main className="main-layout">
        <div className="full-span">
          <SavedViews />
        </div>
        <div className="left-column">
          <CrmMetrics />
          <LeadScoring />
          <ContactsPanel context="dashboard" />
        </div>
        <div className="right-column">
          <DealsBoard />
          <ActivityTimeline />
        </div>
      </main>
    </div>
  );
}
