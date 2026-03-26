import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  createCompanyFormSchema,
  type CreateCompanyFormValues,
} from '../model/companyFormSchema';
import { useCreateCompanyMutation } from '../model/useCreateCompanyMutation';

const defaultValues: CreateCompanyFormValues = {
  name: '',
  domain: '',
};

export function CreateCompanyForm() {
  const mutation = useCreateCompanyMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanyFormSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        reset(defaultValues);
      },
    });
  });

  return (
    <section className="panel">
      <h2>Creer une entreprise</h2>
      <form className="crm-form" onSubmit={onSubmit}>
        <label>
          Nom du compte
          <input {...register('name')} placeholder="Ex: Altis Conseil" />
          {errors.name ? <span>{errors.name.message}</span> : null}
        </label>

        <label>
          Site web
          <input {...register('domain')} placeholder="Ex: altis-conseil.fr" />
          {errors.domain ? <span>{errors.domain.message}</span> : null}
        </label>

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creation...' : 'Creer l entreprise'}
        </button>
        {mutation.isError ? <p>{mutation.error.message}</p> : null}
      </form>
    </section>
  );
}
