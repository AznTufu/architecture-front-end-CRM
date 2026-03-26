import { z } from 'zod';

export const dealStageSchema = z.enum([
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);

export const dealSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  amount: z.number().nonnegative(),
  stage: dealStageSchema,
  owner: z.string().min(1),
  contact_id: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export const createDealPayloadSchema = z.object({
  title: z.string().min(1),
  amount: z.number().nonnegative(),
  stage: dealStageSchema,
  contact_id: z.string().uuid().nullable().optional(),
});

export const updateDealPayloadSchema = z.object({
  deal_id: z.string().uuid(),
  title: z.string().min(1),
  amount: z.number().nonnegative(),
  stage: dealStageSchema,
  contact_id: z.string().uuid().nullable().optional(),
});

export const deleteDealPayloadSchema = z.object({
  deal_id: z.string().uuid(),
});

export type Deal = z.infer<typeof dealSchema>;
export type DealStage = z.infer<typeof dealStageSchema>;
export type CreateDealPayload = z.infer<typeof createDealPayloadSchema>;
export type UpdateDealPayload = z.infer<typeof updateDealPayloadSchema>;
export type DeleteDealPayload = z.infer<typeof deleteDealPayloadSchema>;
