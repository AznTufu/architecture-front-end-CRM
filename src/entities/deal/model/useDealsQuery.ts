import { useQuery } from '@tanstack/react-query';
import type { DealStageFilter } from '../../../shared/store';
import { queryKeys } from '../../../shared/api';
import { fetchDeals } from '../api/dealsApi';

export function useDealsQuery(stage: DealStageFilter) {
  return useQuery({
    queryKey: queryKeys.deals.list,
    queryFn: fetchDeals,
    select: (deals) =>
      stage === 'all' ? deals : deals.filter((deal) => deal.stage === stage),
  });
}
