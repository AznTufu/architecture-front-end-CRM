import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api';
import { fetchContacts } from '../api/contactsApi';

export function useContactsQuery() {
  return useQuery({
    queryKey: queryKeys.contacts.list,
    queryFn: fetchContacts,
  });
}
