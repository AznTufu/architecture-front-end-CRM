import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys, supabaseClient } from '../../shared/api';

export function AuthSessionSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        queryClient.removeQueries({ queryKey: queryKeys.companies.all });
        queryClient.removeQueries({ queryKey: queryKeys.contacts.all });
        queryClient.removeQueries({ queryKey: queryKeys.deals.all });
        queryClient.removeQueries({ queryKey: queryKeys.activities.all });
      }

      queryClient.setQueryData(queryKeys.auth.session, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return null;
}
