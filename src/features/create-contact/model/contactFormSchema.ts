import { z } from 'zod';

export const createContactFormSchema = z.object({
  firstName: z.string().min(1, 'Le prenom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(6, 'Telephone invalide'),
  companyId: z.string().uuid('Entreprise invalide'),
  status: z.enum(['lead', 'opportunity', 'customer', 'unqualified', 'blacklisted']),
});

export type CreateContactFormValues = z.infer<typeof createContactFormSchema>;
