import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { ModerationStatus, Priority } from '@/types/ads';

export type SortBy = 'createdAt' | 'price' | 'priority';
export type SortOrder = 'asc' | 'desc';

export interface AdsFilters {
  page: number;
  status: ModerationStatus[];
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  priority?: Priority;
}

export const defaultFilters: AdsFilters = {
  page: 1,
  status: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const buildSearchParams = (filters: AdsFilters) => {
  const params = new URLSearchParams();

  params.set('page', String(filters.page));
  params.set('sortBy', filters.sortBy);
  params.set('sortOrder', filters.sortOrder);

  if (filters.status.length > 0) {
    filters.status.forEach((status) => params.append('status', status));
  }

  if (filters.categoryId !== undefined) {
    params.set('categoryId', String(filters.categoryId));
  }

  if (filters.minPrice !== undefined) {
    params.set('minPrice', String(filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    params.set('maxPrice', String(filters.maxPrice));
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.priority) {
    params.set('priority', filters.priority);
  }

  return params;
};

export const useAdsFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const filters = useMemo<AdsFilters>(() => {
    const params = {
      ...defaultFilters,
      page: Number(searchParams.get('page')) || 1,
      sortBy: (searchParams.get('sortBy') as SortBy) || defaultFilters.sortBy,
      sortOrder: (searchParams.get('sortOrder') as SortOrder) || defaultFilters.sortOrder,
    };

    const statuses = searchParams.getAll('status');
    if (statuses.length > 0) {
      params.status = statuses as ModerationStatus[];
    }

    const categoryId = searchParams.get('categoryId');
    if (categoryId !== null) {
      params.categoryId = Number(categoryId);
    }

    const minPrice = searchParams.get('minPrice');
    if (minPrice !== null) {
      params.minPrice = Number(minPrice);
    }

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice !== null) {
      params.maxPrice = Number(maxPrice);
    }

    const search = searchParams.get('search');
    if (search) {
      params.search = search;
    }

    const priority = searchParams.get('priority');
    if (priority) {
      params.priority = priority as Priority;
    }

    return params;
  }, [searchParams]);

  const updateFilters = useCallback(
    (next: Partial<AdsFilters>, options: { preservePage?: boolean } = {}) => {
      const merged: AdsFilters = {
        ...filters,
        ...next,
      };

      if (!options.preservePage) {
        merged.page = next.page ?? 1;
      }

      const params = buildSearchParams(merged);
      setSearchParams(params);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    },
    [filters, location.pathname, navigate, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    const params = buildSearchParams(defaultFilters);
    setSearchParams(params);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  }, [location.pathname, navigate, setSearchParams]);

  return {
    filters,
    updateFilters,
    resetFilters,
    buildSearchParams,
  };
};

