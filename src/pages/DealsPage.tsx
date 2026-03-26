import { CreateDealForm } from '../features/create-deal';
import { CrmHeader } from '../widgets/crm-header';
import { DealsManagement } from '../widgets/deals-management';

export function DealsPage() {
  return (
    <div className="app-shell">
      <CrmHeader />
      <main className="main-layout single-column">
        <section className="form-duo-grid">
          <CreateDealForm />
          <DealsManagement />
        </section>
      </main>
    </div>
  );
}
