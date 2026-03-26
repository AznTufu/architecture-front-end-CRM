import { z } from 'zod';

export const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  domain: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export const createCompanyPayloadSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
});

export type Company = z.infer<typeof companySchema>;
export type CreateCompanyPayload = z.infer<typeof createCompanyPayloadSchema>;
