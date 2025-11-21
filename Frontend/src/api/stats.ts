import { apiClient } from '@/api/client';
import type {
  ActivityPoint,
  CategoriesChart,
  DecisionsChart,
  StatsPeriod,
  SummaryStats,
} from '@/types/stats';

const withPeriod = (period: StatsPeriod) => ({ params: { period } });

export const fetchSummaryStats = async (period: StatsPeriod, signal?: AbortSignal) => {
  const { data } = await apiClient.get<SummaryStats>('/stats/summary', {
    ...withPeriod(period),
    signal,
  });
  return data;
};

export const fetchActivityChart = async (period: StatsPeriod, signal?: AbortSignal) => {
  const { data } = await apiClient.get<ActivityPoint[]>('/stats/chart/activity', {
    ...withPeriod(period),
    signal,
  });
  return data;
};

export const fetchDecisionsChart = async (period: StatsPeriod, signal?: AbortSignal) => {
  const { data } = await apiClient.get<DecisionsChart>('/stats/chart/decisions', {
    ...withPeriod(period),
    signal,
  });
  return data;
};

export const fetchCategoriesChart = async (period: StatsPeriod, signal?: AbortSignal) => {
  const { data } = await apiClient.get<CategoriesChart>('/stats/chart/categories', {
    ...withPeriod(period),
    signal,
  });
  return data;
};

