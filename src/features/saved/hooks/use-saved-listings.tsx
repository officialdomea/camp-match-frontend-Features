import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "campmatch.saved-listings";

type SavedListingsValue = {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
};

const SavedListingsContext = createContext<SavedListingsValue | null>(null);

export function SavedListingsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const value = useMemo<SavedListingsValue>(
    () => ({
      savedIds,
      isSaved: (id: string) => savedIds.includes(id),
      toggleSaved,
    }),
    [savedIds, toggleSaved],
  );

  return <SavedListingsContext.Provider value={value}>{children}</SavedListingsContext.Provider>;
}

export function useSavedListings() {
  const context = useContext(SavedListingsContext);
  if (!context) {
    throw new Error("useSavedListings must be used inside SavedListingsProvider");
  }
  return context;
}
