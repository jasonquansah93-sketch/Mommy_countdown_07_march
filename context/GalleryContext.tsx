import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Moment } from '../types';
import { loadJSON, saveJSON } from '../utils/storage';

const STORAGE_KEY = 'mommy_moments';

interface GalleryContextType {
  moments: Moment[];
  addMoment: (moment: Moment) => void;
  removeMoment: (id: string) => void;
}

const GalleryContext = createContext<GalleryContextType>({
  moments: [],
  addMoment: () => {},
  removeMoment: () => {},
});

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [moments, setMoments] = useState<Moment[]>([]);

  useEffect(() => {
    loadJSON<Moment[]>(STORAGE_KEY).then((saved) => {
      if (saved) setMoments(saved);
    });
  }, []);

  const addMoment = useCallback((moment: Moment) => {
    setMoments((prev) => {
      const next = [moment, ...prev];
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const removeMoment = useCallback((id: string) => {
    setMoments((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <GalleryContext.Provider value={{ moments, addMoment, removeMoment }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  return useContext(GalleryContext);
}
