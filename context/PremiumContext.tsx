import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

const STORAGE_KEY = 'mommy_premium';

export const FREE_MOMENT_LIMIT = 5;

interface PremiumContextType {
  isPremium: boolean;
  togglePremium: () => void;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  togglePremium: () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadJSON<boolean>(STORAGE_KEY).then((saved) => {
      if (saved !== null) setIsPremium(saved === true);
    });
  }, []);

  const togglePremium = useCallback(() => {
    setIsPremium((prev) => {
      const next = !prev;
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, togglePremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
