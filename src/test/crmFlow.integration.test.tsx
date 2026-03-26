import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ActivityTimeline } from '../widgets/activity-timeline';
import { DealsBoard } from '../widgets/deals-board';
import { LeadScoring } from '../widgets/lead-scoring';
import { CreateContactForm } from '../features/create-contact';
import { CreateDealForm } from '../features/create-deal';

type ContactRow = {
  id: string;
  full_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  status: 'lead' | 'opportunity' | 'customer' | 'unqualified' | 'blacklisted';
  created_at?: string | null;
};

type DealRow = {
  id: string;
  title: string;
  amount: number;
  stage:
    | 'prospecting'
    | 'qualification'
    | 'proposal'
    | 'negotiation'
    | 'closed_won'
    | 'closed_lost';
  owner: string;
  contact_id?: string | null;
  created_at?: string | null;
};

type ActivityRow = {
  id: string;
  contact_id?: string | null;
  deal_id?: string | null;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task_reminder';
  title: string;
  description?: string | null;
  created_at?: string | null;
  contact_name?: string | null;
  deal_title?: string | null;
};

const companies = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Acme Paris' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Nordic Flow' },
];

let contacts: ContactRow[] = [];
let deals: DealRow[] = [];
let activities: ActivityRow[] = [];

vi.mock('../entities/company', () => ({
  useCompaniesQuery: () => ({
    data: companies,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock('../entities/contact', async () => {
  const actual = await vi.importActual<typeof import('../entities/contact')>('../entities/contact');
  return {
    ...actual,
    useContactsQuery: () => ({
      data: contacts,
      isPending: false,
      isError: false,
      error: null,
    }),
  };
});

vi.mock('../entities/deal', async () => {
  const actual = await vi.importActual<typeof import('../entities/deal')>('../entities/deal');
  return {
    ...actual,
    useDealsQuery: () => ({
      data: deals,
      isPending: false,
      isError: false,
      error: null,
    }),
    useUpdateDealStageMutation: () => ({
      mutate: vi.fn(),
      isError: false,
      error: null,
    }),
  };
});

vi.mock('../entities/activity', async () => {
  const actual = await vi.importActual<typeof import('../entities/activity')>('../entities/activity');
  return {
    ...actual,
    useActivitiesQuery: () => ({
      data: activities,
      isPending: false,
      isError: false,
      error: null,
    }),
  };
});

vi.mock('../features/create-contact/model/useCreateContactMutation', () => ({
  useCreateContactMutation: () => ({
    mutate: (values: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      companyId: string;
      status: ContactRow['status'];
    }, options?: { onSuccess?: () => void }) => {
      const companyName = companies.find((company) => company.id === values.companyId)?.name ?? '';
      contacts = [
        {
          id: '33333333-3333-4333-8333-333333333333',
          full_name: `${values.firstName} ${values.lastName}`,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
          company: companyName,
          status: values.status,
          created_at: new Date().toISOString(),
        },
        ...contacts,
      ];
      options?.onSuccess?.();
    },
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock('../features/create-deal/model/useCreateDealMutation', () => ({
  useCreateDealMutation: () => ({
    mutate: (values: {
      title: string;
      amount: number;
      stage: DealRow['stage'];
      contactId: string;
    }, options?: { onSuccess?: () => void }) => {
      const contact = contacts.find((entry) => entry.id === values.contactId);
      const createdDeal: DealRow = {
        id: '44444444-4444-4444-8444-444444444444',
        title: values.title,
        amount: values.amount,
        stage: values.stage,
        owner: 'demo.user@crm.fr',
        contact_id: values.contactId,
        created_at: new Date().toISOString(),
      };

      deals = [createdDeal, ...deals];
      activities = [
        {
          id: '55555555-5555-4555-8555-555555555555',
          contact_id: values.contactId,
          deal_id: createdDeal.id,
          type: 'note',
          title: `Deal cree: ${values.title}`,
          description: 'Creation depuis formulaire',
          created_at: new Date().toISOString(),
          contact_name: contact?.full_name ?? null,
          deal_title: values.title,
        },
        ...activities,
      ];
      options?.onSuccess?.();
    },
    isPending: false,
    isError: false,
    error: null,
  }),
}));

function TestHarness() {
  return (
    <div>
      <CreateContactForm />
      <CreateDealForm />
      <DealsBoard />
      <ActivityTimeline />
      <LeadScoring />
    </div>
  );
}

describe('CRM flow integration', () => {
  it('create contact puis create deal alimente pipeline, timeline et scoring avec filtre score et drawer', async () => {
    contacts = [
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        full_name: 'Alice Martin',
        last_name: 'Martin',
        email: 'alice@acme.fr',
        phone: '+33601010101',
        company: 'Acme Paris',
        status: 'lead',
        created_at: new Date().toISOString(),
      },
    ];

    deals = [];
    activities = [
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        contact_id: contacts[0].id,
        deal_id: null,
        type: 'note',
        title: 'Activite sans deal',
        created_at: new Date().toISOString(),
        contact_name: contacts[0].full_name,
      },
    ];

    const user = userEvent.setup();
    const view = render(<TestHarness />);

    await user.type(screen.getByPlaceholderText('Ex: Laura'), 'Karim');
    await user.type(screen.getByPlaceholderText('Ex: Martin'), 'Benali');
    await user.type(screen.getByPlaceholderText('contact@entreprise.com'), 'karim@nordicflow.io');
    await user.type(screen.getByPlaceholderText('Ex: +33 6 12 34 56 78'), '+33602020202');
    await user.selectOptions(screen.getByLabelText('Entreprise'), companies[1].id);
    await user.click(screen.getByRole('button', { name: 'Créer le contact' }));

    view.rerender(<TestHarness />);

    await user.selectOptions(screen.getByLabelText('Contact'), '33333333-3333-4333-8333-333333333333');
    await user.type(screen.getByPlaceholderText('Ex: Contrat annuel Enterprise'), 'Deal Karim Enterprise');
    await user.clear(screen.getByLabelText('Montant (€)'));
    await user.type(screen.getByLabelText('Montant (€)'), '20000');
    await user.selectOptions(screen.getByLabelText('Etape'), 'negotiation');
    await user.click(screen.getByRole('button', { name: 'Creer le deal' }));

    view.rerender(<TestHarness />);

    expect(screen.getByText('Deal Karim Enterprise')).toBeInTheDocument();
    expect(screen.queryByText('Activite sans deal')).not.toBeInTheDocument();
    expect(screen.getByText(/Deal cree: Deal Karim Enterprise/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filtre score'), 'high');
    expect(screen.getByRole('heading', { name: 'Karim Benali' })).toBeInTheDocument();

    await user.click(screen.getByRole('heading', { name: 'Karim Benali' }));
    expect(screen.getByRole('dialog', { name: 'Fiche contact' })).toBeInTheDocument();
    expect(screen.getByText('1 deal')).toBeInTheDocument();
    expect(screen.getByText('1 activite')).toBeInTheDocument();
  });
});
