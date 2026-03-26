import { supabaseClient } from '../../../shared/api';
import {
  createDealPayloadSchema,
  deleteDealPayloadSchema,
  dealSchema,
  type CreateDealPayload,
  type DeleteDealPayload,
  type Deal,
  type DealStage,
  type UpdateDealPayload,
  updateDealPayloadSchema,
} from '../model/schema';

export async function fetchDeals(): Promise<Deal[]> {
  const { data, error } = await supabaseClient
    .from('deals')
    .select('id, title, amount, stage, owner:user_id, contact_id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data: authData } = await supabaseClient.auth.getUser();
  const userEmail = authData.user?.email?.trim() || null;
  const parsedDeals = dealSchema.array().parse(data ?? []);

  return parsedDeals.map((deal) => ({
    ...deal,
    owner: userEmail ?? deal.owner,
  }));
}

export async function updateDealStage(payload: {
  dealId: string;
  stage: DealStage;
}): Promise<void> {
  try {
    const { data, error } = await supabaseClient.rpc('update_deal_stage', {
      p_deal_id: payload.dealId,
      p_stage: payload.stage,
    });

    if (error) {
      throw new Error(error.message);
    }

    if ((data ?? 0) === 0) {
      throw new Error('Aucun deal mis a jour. Verifie les droits ou la propriete du deal.');
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Erreur reseau lors du deplacement. Verifie la connexion puis reessaie.');
    }
    throw error;
  }
}

export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  const validatedPayload = createDealPayloadSchema.parse(payload);

  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  if (authError) {
    throw new Error('Session manquante. Connecte-toi pour creer un deal.');
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Session manquante. Connecte-toi pour creer un deal.');
  }

  const { data, error } = await supabaseClient
    .from('deals')
    .insert({
      user_id: userId,
      title: validatedPayload.title,
      amount: validatedPayload.amount,
      stage: validatedPayload.stage,
      contact_id: validatedPayload.contact_id,
    })
    .select('id, title, amount, stage, owner:user_id, contact_id, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return dealSchema.parse(data);
}

export async function updateDeal(payload: UpdateDealPayload): Promise<void> {
  const validatedPayload = updateDealPayloadSchema.parse(payload);

  const { data, error } = await supabaseClient.rpc('update_deal', {
    p_deal_id: validatedPayload.deal_id,
    p_title: validatedPayload.title,
    p_amount: validatedPayload.amount,
    p_stage: validatedPayload.stage,
    p_contact_id: validatedPayload.contact_id,
  });

  if (error) {
    throw new Error(error.message);
  }

  if ((data ?? 0) === 0) {
    throw new Error('Aucun deal mis a jour. Verifie les droits ou la propriete du deal.');
  }
}

export async function deleteDeal(payload: DeleteDealPayload): Promise<void> {
  const validatedPayload = deleteDealPayloadSchema.parse(payload);

  const { data, error } = await supabaseClient.rpc('delete_deal', {
    p_deal_id: validatedPayload.deal_id,
  });

  if (error) {
    throw new Error(error.message);
  }

  if ((data ?? 0) === 0) {
    throw new Error('Aucun deal supprime. Verifie les droits ou la propriete du deal.');
  }
}
