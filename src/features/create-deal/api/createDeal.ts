import { createDeal } from '../../../entities/deal';
import type { CreateDealFormValues } from '../model/dealFormSchema';

export async function createDealFromForm(values: CreateDealFormValues) {
  return createDeal({
    title: values.title,
    amount: values.amount,
    stage: values.stage,
    contact_id: values.contactId,
  });
}
