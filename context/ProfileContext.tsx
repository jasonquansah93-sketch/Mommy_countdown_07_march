import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BabyProfile } from '../types';
import { loadJSON, saveJSON } from '../utils/storage';

const STORAGE_KEY = 'mommy_profile';

// Default due date: 6 months from now
const defaultDueDate = new Date();
defaultDueDate.setMonth(defaultDueDate.getMonth() + 6);

// Default start date: 40 weeks before due date
const defaultStartDate = new Date(defaultDueDate);
defaultStartDate.setDate(defaultStartDate.getDate() - 280);

const DEFAULT_PROFILE: BabyProfile = {
  name: '',
  dueDate: defaultDueDate.toISOString(),
  startDate: defaultStartDate.toISOString(),
  gender: 'surprise',
  timerDisplayMode: 'days',
  countdownStarted: false,
};

interface ProfileContextType {
  profile: BabyProfile;
  updateProfile: (updates: Partial<BabyProfile>) => void;
  resetProfile: () => void;
  isLoaded: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  resetProfile: () => {},
  isLoaded: false,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<BabyProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadJSON<BabyProfile>(STORAGE_KEY).then((saved) => {
      if (saved) setProfile({ ...DEFAULT_PROFILE, ...saved });
      setIsLoaded(true);
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<BabyProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    saveJSON(STORAGE_KEY, DEFAULT_PROFILE);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, resetProfile, isLoaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
