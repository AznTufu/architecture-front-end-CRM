import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api';
import { createContactFromForm } from '../api/createContact';

export function useCreateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContactFromForm,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
}
