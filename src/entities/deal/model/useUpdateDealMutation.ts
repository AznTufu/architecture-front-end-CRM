import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api';
import { updateDeal } from '../api/dealsApi';

export function useUpdateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDeal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}
