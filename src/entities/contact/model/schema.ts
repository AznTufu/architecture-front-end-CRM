import { z } from 'zod';

export const contactStatusSchema = z.enum([
  'lead',
  'opportunity',
  'customer',
  'unqualified',
  'blacklisted',
]);

export const contactSchema = z.object({
  id: z.string().min(1),
  full_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  company: z.string().nullable().transform((value) => value ?? ''),
  status: contactStatusSchema,
  created_at: z.string().nullable().optional(),
});

export const createContactPayloadSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  company_id: z.string().uuid(),
  status: contactStatusSchema,
});

export type Contact = z.infer<typeof contactSchema>;
export type ContactStatus = z.infer<typeof contactStatusSchema>;
export type CreateContactPayload = z.infer<typeof createContactPayloadSchema>;
