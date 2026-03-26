import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../api';
import { fetchSession } from '../api/authApi';

export function useSessionQuery() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: fetchSession,
    staleTime: 60_000,
  });
}
