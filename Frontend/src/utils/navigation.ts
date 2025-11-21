const STORAGE_KEY = 'ads-navigation';

interface NavigationSnapshot {
  ids: number[];
  timestamp: number;
}

export const saveNavigationSnapshot = (ids: number[]) => {
  if (ids.length === 0) {
    return;
  }

  const snapshot: NavigationSnapshot = {
    ids,
    timestamp: Date.now(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

const getSnapshot = (): NavigationSnapshot | null => {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as NavigationSnapshot;
  } catch {
    return null;
  }
};

export const getNeighborIds = (currentId: number, fallbackIds?: number[]) => {
  const snapshot = fallbackIds
    ? { ids: fallbackIds }
    : getSnapshot();

  if (!snapshot || snapshot.ids.length === 0) {
    return { prevId: null, nextId: null };
  }

  const index = snapshot.ids.indexOf(currentId);
  if (index === -1) {
    return { prevId: null, nextId: null };
  }

  return {
    prevId: index > 0 ? snapshot.ids[index - 1] : null,
    nextId: index < snapshot.ids.length - 1 ? snapshot.ids[index + 1] : null,
  };
};

