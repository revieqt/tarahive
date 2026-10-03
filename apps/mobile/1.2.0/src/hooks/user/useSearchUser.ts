import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@/services/userService';

export const useSearchUser = (search: string) => {
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const query = useQuery({
    queryKey: ['user-search', debouncedSearch],
    queryFn: () => searchUsers(debouncedSearch),
    enabled: debouncedSearch.length >= 3,
    staleTime: 30_000,
  });

  return {
    ...query,
    isDebouncing: search.trim() !== debouncedSearch,
  };
};