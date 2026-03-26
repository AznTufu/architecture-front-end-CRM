import { createContact } from '../../../entities/contact';
import type { CreateContactFormValues } from '../model/contactFormSchema';

export async function createContactFromForm(values: CreateContactFormValues) {
  return createContact({
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
    phone: values.phone,
    company_id: values.companyId,
    status: values.status,
  });
}
