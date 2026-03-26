import { supabaseClient } from '../../../shared/api';
import { z } from 'zod';
import {
  type Contact,
  contactStatusSchema,
  contactSchema,
  createContactPayloadSchema,
  type CreateContactPayload,
} from '../model/schema';

const contactRowSchema = z.object({
  id: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().nullable().optional(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  status: contactStatusSchema,
  created_at: z.string().nullable().optional(),
  companies: z.object({ name: z.string() }).nullable().optional(),
});

export async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await supabaseClient
    .from('contacts')
    .select('id, first_name, last_name, email, phone, status, created_at, companies(name)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = contactRowSchema.array().parse(data ?? []);

  return rows.map((row) =>
    contactSchema.parse({
      id: row.id,
      full_name: `${row.first_name} ${row.last_name ?? ''}`.trim(),
      last_name: row.last_name?.trim() || 'Unknown',
      email: row.email,
      phone: row.phone?.trim() || 'N/A',
      company: row.companies?.name ?? '',
      status: row.status,
      created_at: row.created_at,
    })
  );
}

export async function createContact(payload: CreateContactPayload): Promise<Contact> {
  const validatedPayload = createContactPayloadSchema.parse(payload);

  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  if (authError) {
    throw new Error('Session manquante. Connecte-toi pour creer un contact.');
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Session manquante. Connecte-toi pour creer un contact.');
  }

  const { data, error } = await supabaseClient
    .from('contacts')
    .insert({
      user_id: userId,
      first_name: validatedPayload.first_name,
      last_name: validatedPayload.last_name,
      email: validatedPayload.email,
      phone: validatedPayload.phone,
      status: validatedPayload.status,
      company_id: validatedPayload.company_id,
    })
    .select('id, first_name, last_name, email, phone, status, created_at, companies(name)')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Un contact avec cet email existe deja pour cet utilisateur.');
    }
    throw new Error(error.message);
  }

  const row = contactRowSchema.parse(data);

  return contactSchema.parse({
    id: row.id,
    full_name: `${row.first_name} ${row.last_name ?? ''}`.trim(),
    last_name: row.last_name ?? validatedPayload.last_name,
    email: row.email,
    phone: row.phone ?? validatedPayload.phone,
    company: row.companies?.name ?? '',
    status: row.status,
    created_at: row.created_at,
  });
}
