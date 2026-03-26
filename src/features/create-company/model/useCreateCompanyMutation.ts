import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api';
import { createCompanyFromForm } from '../api/createCompany';

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompanyFromForm,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
}
