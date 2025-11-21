import { apiClient } from '@/api/client';
import type { Moderator } from '@/types/moderator';

export const fetchCurrentModerator = async (signal?: AbortSignal) => {
  const { data } = await apiClient.get<Moderator>('/moderators/me', {
    signal,
  });
  return data;
};

