import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CreateContactForm } from '../features/create-contact';

const mutate = vi.fn();
const companies = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Acme Paris' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Nordic Flow' },
];

vi.mock('../features/create-contact/model/useCreateContactMutation', () => ({
  useCreateContactMutation: () => ({
    mutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock('../entities/company', () => ({
  useCompaniesQuery: () => ({
    data: companies,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

describe('CreateContactForm', () => {
  it('affiche des erreurs de validation si le formulaire est invalide', async () => {
    mutate.mockReset();
    const user = userEvent.setup();
    render(<CreateContactForm />);

    await user.type(screen.getByPlaceholderText('contact@entreprise.com'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Créer le contact' }));

    expect(await screen.findByText('Email invalide')).toBeInTheDocument();
  });

  it('soumet le formulaire quand les donnees sont valides', async () => {
    mutate.mockReset();
    const user = userEvent.setup();
    render(<CreateContactForm />);

    await user.type(screen.getByPlaceholderText('Ex: Laura'), 'Laura');
    await user.type(screen.getByPlaceholderText('Ex: Martin'), 'Martin');
    await user.type(screen.getByPlaceholderText('contact@entreprise.com'), 'laura@horizon.com');
    await user.type(screen.getByPlaceholderText('Ex: +33 6 12 34 56 78'), '+33612345678');
    await user.selectOptions(screen.getByLabelText('Entreprise'), companies[1].id);
    await user.click(screen.getByRole('button', { name: 'Créer le contact' }));

    expect(mutate).toHaveBeenCalledWith(
      {
        firstName: 'Laura',
        lastName: 'Martin',
        email: 'laura@horizon.com',
        phone: '+33612345678',
        companyId: companies[1].id,
        status: 'lead',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
  });
});
