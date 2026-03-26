import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api';
import { updateDealStage } from '../api/dealsApi';
import type { Deal } from './schema';

export function useUpdateDealStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDealStage,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deals.list });
      const previousDeals = queryClient.getQueryData<Deal[]>(queryKeys.deals.list);

      queryClient.setQueryData<Deal[]>(queryKeys.deals.list, (currentDeals) =>
        (currentDeals ?? []).map((deal) =>
          deal.id === payload.dealId ? { ...deal, stage: payload.stage } : deal
        )
      );

      return { previousDeals };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousDeals) {
        queryClient.setQueryData(queryKeys.deals.list, context.previousDeals);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
    },
  });
}
