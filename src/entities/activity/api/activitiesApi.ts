import { z } from 'zod';
import { supabaseClient } from '../../../shared/api';
import {
  activitySchema,
  createActivityPayloadSchema,
  type Activity,
  type CreateActivityPayload,
} from '../model/schema';

const activityRowSchema = z.object({
  id: z.string().uuid(),
  contact_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),
  type: z.enum(['call', 'email', 'meeting', 'note', 'task_reminder']),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  contacts: z
    .object({
      first_name: z.string().nullable().optional(),
      last_name: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  deals: z
    .object({
      title: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabaseClient
    .from('activities')
    .select(
      'id, contact_id, deal_id, type, title, description, created_at, contacts(first_name,last_name), deals(title)'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const rows = activityRowSchema.array().parse(data ?? []);

  return rows.map((row) =>
    activitySchema.parse({
      id: row.id,
      contact_id: row.contact_id,
      deal_id: row.deal_id,
      type: row.type,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      contact_name: row.contacts
        ? `${row.contacts.first_name ?? ''} ${row.contacts.last_name ?? ''}`.trim() || null
        : null,
      deal_title: row.deals?.title ?? null,
    })
  );
}

export async function createActivity(payload: CreateActivityPayload): Promise<Activity> {
  const validatedPayload = createActivityPayloadSchema.parse(payload);

  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  if (authError) {
    throw new Error('Session manquante. Connecte-toi pour creer une activite.');
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Session manquante. Connecte-toi pour creer une activite.');
  }

  const { data, error } = await supabaseClient
    .from('activities')
    .insert({
      user_id: userId,
      contact_id: validatedPayload.contact_id,
      deal_id: validatedPayload.deal_id,
      type: validatedPayload.type,
      title: validatedPayload.title,
      description: validatedPayload.description,
    })
    .select(
      'id, contact_id, deal_id, type, title, description, created_at, contacts(first_name,last_name), deals(title)'
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const row = activityRowSchema.parse(data);

  return activitySchema.parse({
    id: row.id,
    contact_id: row.contact_id,
    deal_id: row.deal_id,
    type: row.type,
    title: row.title,
    description: row.description,
    created_at: row.created_at,
    contact_name: row.contacts
      ? `${row.contacts.first_name ?? ''} ${row.contacts.last_name ?? ''}`.trim() || null
      : null,
    deal_title: row.deals?.title ?? null,
  });
}
