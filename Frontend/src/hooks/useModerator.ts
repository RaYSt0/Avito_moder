import { useQuery } from '@tanstack/react-query';
import { fetchCurrentModerator } from '@/api/moderator';

export const useModerator = () =>
  useQuery({
    queryKey: ['moderator'],
    queryFn: ({ signal }) => fetchCurrentModerator(signal),
    staleTime: 1000 * 60 * 5,
  });

