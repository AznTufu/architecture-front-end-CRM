import { z } from 'zod';

export const activityTypeSchema = z.enum([
  'call',
  'email',
  'meeting',
  'note',
  'task_reminder',
]);

export const activitySchema = z.object({
  id: z.string().uuid(),
  contact_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),
  type: activityTypeSchema,
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  deal_title: z.string().nullable().optional(),
});

export const createActivityPayloadSchema = z.object({
  contact_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),
  type: activityTypeSchema,
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});

export type Activity = z.infer<typeof activitySchema>;
export type ActivityType = z.infer<typeof activityTypeSchema>;
export type CreateActivityPayload = z.infer<typeof createActivityPayloadSchema>;
