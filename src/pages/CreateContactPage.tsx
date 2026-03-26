import { CreateContactForm } from '../features/create-contact';
import { CreateCompanyForm } from '../features/create-company';
import { CrmHeader } from '../widgets/crm-header';
import { useNavigate } from 'react-router-dom';

export function CreateContactPage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <CrmHeader />
      <main className="main-layout single-column">
        <section className="panel inline-banner">
          <p className="meta m-0">Creation contact et entreprise</p>
          <button type="button" className="ghost-toggle" onClick={() => navigate(-1)}>
            Retour
          </button>
        </section>

        <section className="form-duo-grid">
          <CreateContactForm />
          <CreateCompanyForm />
        </section>
      </main>
    </div>
  );
}
