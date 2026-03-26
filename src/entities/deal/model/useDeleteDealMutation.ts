import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api';
import { deleteDeal } from '../api/dealsApi';

export function useDeleteDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDeal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}
