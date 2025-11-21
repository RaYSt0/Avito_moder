import { apiClient } from '@/api/client';
import type { Ad, AdsResponse, ModerationStatus, Priority } from '@/types/ads';

export interface AdsQueryParams {
  page: number;
  limit: number;
  status?: ModerationStatus[];
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'createdAt' | 'price' | 'priority';
  sortOrder?: 'asc' | 'desc';
  priority?: Priority;
}

export const fetchAds = async (
  params: AdsQueryParams,
  signal?: AbortSignal,
): Promise<AdsResponse> => {
  const { data } = await apiClient.get<AdsResponse>('/ads', {
    params,
    signal,
  });

  return data;
};

export const fetchAdById = async (id: number, signal?: AbortSignal): Promise<Ad> => {
  const { data } = await apiClient.get<Ad>(`/ads/${id}`, { signal });
  return data;
};

export const approveAdRequest = async (id: number) => {
  const { data } = await apiClient.post(`/ads/${id}/approve`);
  return data;
};

export const rejectAdRequest = async (id: number, payload: { reason: string; comment?: string }) => {
  const { data } = await apiClient.post(`/ads/${id}/reject`, payload);
  return data;
};

export const requestChangesAd = async (id: number, payload: { reason: string; comment?: string }) => {
  const { data } = await apiClient.post(`/ads/${id}/request-changes`, payload);
  return data;
};

