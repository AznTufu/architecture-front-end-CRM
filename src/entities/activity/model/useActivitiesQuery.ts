import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api';
import { fetchActivities } from '../api/activitiesApi';

export function useActivitiesQuery() {
  return useQuery({
    queryKey: queryKeys.activities.list,
    queryFn: fetchActivities,
  });
}
