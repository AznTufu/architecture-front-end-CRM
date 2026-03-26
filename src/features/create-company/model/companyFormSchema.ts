import { z } from 'zod';

export const createCompanyFormSchema = z.object({
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  domain: z.string().min(1, 'Le domaine est requis'),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanyFormSchema>;
