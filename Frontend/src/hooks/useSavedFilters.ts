import { useEffect, useState, useCallback } from 'react';
import type { AdsFilters } from '@/hooks/useAdsFilters';

export interface SavedFilter {
  id: string;
  name: string;
  filters: AdsFilters;
  createdAt: number;
}

const STORAGE_KEY = 'ads-filter-presets';

const readStorage = (): SavedFilter[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as SavedFilter[];
  } catch {
    return [];
  }
};

export const useSavedFilters = () => {
  const [presets, setPresets] = useState<SavedFilter[]>([]);

  useEffect(() => {
    setPresets(readStorage());
  }, []);

  const persist = useCallback((next: SavedFilter[]) => {
    setPresets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const savePreset = useCallback(
    (name: string, filters: AdsFilters) => {
      const preset: SavedFilter = {
        id: crypto.randomUUID(),
        name,
        filters,
        createdAt: Date.now(),
      };

      persist([...presets, preset]);
      return preset;
    },
    [persist, presets],
  );

  const removePreset = useCallback(
    (id: string) => {
      persist(presets.filter((preset) => preset.id !== id));
    },
    [persist, presets],
  );

  return {
    presets,
    savePreset,
    removePreset,
  };
};

