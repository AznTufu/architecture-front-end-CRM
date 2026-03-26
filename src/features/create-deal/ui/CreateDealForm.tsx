import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useContactsQuery } from '../../../entities/contact';
import { dealStageSchema } from '../../../entities/deal';
import {
  createDealFormSchema,
  type CreateDealFormValues,
} from '../model/dealFormSchema';
import { useCreateDealMutation } from '../model/useCreateDealMutation';

const defaultValues: CreateDealFormValues = {
  title: '',
  amount: 0,
  stage: 'prospecting',
  contactId: '',
};

export function CreateDealForm() {
  const contactsQuery = useContactsQuery();
  const mutation = useCreateDealMutation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateDealFormValues>({
    resolver: zodResolver(createDealFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const firstContactId = contactsQuery.data?.[0]?.id;
    if (firstContactId) {
      setValue('contactId', firstContactId, { shouldValidate: false });
    }
  }, [contactsQuery.data, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      reset({
        ...defaultValues,
        contactId: contactsQuery.data?.[0]?.id ?? defaultValues.contactId,
      });
    } catch (error) {
      console.error('create-deal submit failed', error);
    }
  });

  if (contactsQuery.isPending) {
    return <section className="panel">Chargement des contacts...</section>;
  }

  if (contactsQuery.isError) {
    return <section className="panel">Erreur contacts: {contactsQuery.error.message}</section>;
  }

  if (contactsQuery.data.length === 0) {
    return (
      <section className="panel">
        <h2>Creer un deal</h2>
        <p className="meta">Ajoute d'abord un contact pour lui assigner un deal.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Creer un deal</h2>
      <form className="crm-form" onSubmit={onSubmit}>
        <label>
          Contact
          <select {...register('contactId')}>
            {contactsQuery.data.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.full_name}
              </option>
            ))}
          </select>
          {errors.contactId ? <span>{errors.contactId.message}</span> : null}
        </label>

        <label>
          Titre du deal
          <input {...register('title')} placeholder="Ex: Contrat annuel Enterprise" />
          {errors.title ? <span>{errors.title.message}</span> : null}
        </label>

        <label>
          Montant (€)
          <input type="number" min="0" step="100" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <span>{errors.amount.message}</span> : null}
        </label>

        <label>
          Etape
          <select {...register('stage')}>
            {dealStageSchema.options.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          {errors.stage ? <span>{errors.stage.message}</span> : null}
        </label>

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creation...' : 'Creer le deal'}
        </button>
        {mutation.isError ? <p>{mutation.error.message}</p> : null}
      </form>
    </section>
  );
}
