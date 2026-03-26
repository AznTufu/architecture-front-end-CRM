import { createCompany } from '../../../entities/company';
import type { CreateCompanyFormValues } from '../model/companyFormSchema';

export async function createCompanyFromForm(values: CreateCompanyFormValues) {
  return createCompany({
    name: values.name,
    domain: values.domain,
  });
}
