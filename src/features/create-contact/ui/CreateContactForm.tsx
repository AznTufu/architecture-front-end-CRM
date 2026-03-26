import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCompaniesQuery } from '../../../entities/company';
import {
  createContactFormSchema,
  type CreateContactFormValues,
} from '../model/contactFormSchema';
import { useCreateContactMutation } from '../model/useCreateContactMutation';

const defaultValues: CreateContactFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyId: '',
  status: 'lead',
};

export function CreateContactForm() {
  const mutation = useCreateContactMutation();
  const companiesQuery = useCompaniesQuery();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateContactFormValues>({
    resolver: zodResolver(createContactFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const firstCompanyId = companiesQuery.data?.[0]?.id;
    if (firstCompanyId) {
      setValue('companyId', firstCompanyId, { shouldValidate: false });
    }
  }, [companiesQuery.data, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      reset({
        ...defaultValues,
        companyId: companiesQuery.data?.[0]?.id ?? defaultValues.companyId,
      });
    } catch {
    }
  });

  if (companiesQuery.isPending) {
    return <section className="panel">Chargement des entreprises...</section>;
  }

  if (companiesQuery.isError) {
    return <section className="panel">Erreur entreprises: {companiesQuery.error.message}</section>;
  }

  const companies = companiesQuery.data;
  const hasCompanies = companies.length > 0;

  if (!hasCompanies) {
    return <section className="panel">Aucune entreprise disponible pour le moment.</section>;
  }

  return (
    <section className="panel">
      <h2>Creer un contact</h2>
      <form className="crm-form" onSubmit={onSubmit}>
        <label>
          Prenom
          <input {...register('firstName')} placeholder="Ex: Laura" />
          {errors.firstName ? <span>{errors.firstName.message}</span> : null}
        </label>

        <label>
          Nom
          <input {...register('lastName')} placeholder="Ex: Martin" />
          {errors.lastName ? <span>{errors.lastName.message}</span> : null}
        </label>

        <label>
          Email
          <input {...register('email')} placeholder="contact@entreprise.com" />
          {errors.email ? <span>{errors.email.message}</span> : null}
        </label>

        <label>
          Telephone
          <input {...register('phone')} placeholder="Ex: +33 6 12 34 56 78" />
          {errors.phone ? <span>{errors.phone.message}</span> : null}
        </label>

        <label>
          Entreprise
          <select {...register('companyId')}>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId ? <span>{errors.companyId.message}</span> : null}
        </label>

        <label>
          Statut
          <select {...register('status')}>
            <option value="lead">lead</option>
            <option value="opportunity">opportunity</option>
            <option value="customer">customer</option>
            <option value="unqualified">unqualified</option>
            <option value="blacklisted">blacklisted</option>
          </select>
        </label>

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Création...' : 'Créer le contact'}
        </button>
        {mutation.isError ? <p>{mutation.error.message}</p> : null}
      </form>
    </section>
  );
}
