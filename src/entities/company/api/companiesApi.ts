import { supabaseClient } from '../../../shared/api';
import {
  companySchema,
  createCompanyPayloadSchema,
  type Company,
  type CreateCompanyPayload,
} from '../model/schema';

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabaseClient
    .from('companies')
    .select('id, name, domain, created_at')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return companySchema.array().parse(data ?? []);
}

export async function createCompany(payload: CreateCompanyPayload): Promise<Company> {
  const validatedPayload = createCompanyPayloadSchema.parse(payload);

  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  if (authError) {
    throw new Error('Session manquante. Connecte-toi pour creer une entreprise.');
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Session manquante. Connecte-toi pour creer une entreprise.');
  }

  const { data, error } = await supabaseClient
    .from('companies')
    .insert({
      user_id: userId,
      name: validatedPayload.name,
      domain: validatedPayload.domain,
    })
    .select('id, name, domain, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return companySchema.parse(data);
}
