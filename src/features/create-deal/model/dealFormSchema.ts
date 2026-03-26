import { z } from 'zod';
import { dealStageSchema } from '../../../entities/deal';

export const createDealFormSchema = z.object({
  title: z.string().min(1, 'Le titre du deal est requis'),
  amount: z.number().min(0, 'Le montant doit etre positif'),
  stage: dealStageSchema,
  contactId: z.string().uuid('Contact invalide'),
});

export type CreateDealFormValues = z.infer<typeof createDealFormSchema>;
