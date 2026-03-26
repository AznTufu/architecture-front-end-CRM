import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/api';
import { fetchCompanies } from '../api/companiesApi';

export function useCompaniesQuery() {
  return useQuery({
    queryKey: queryKeys.companies.list,
    queryFn: fetchCompanies,
  });
}
