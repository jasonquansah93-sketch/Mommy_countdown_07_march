import React from 'react';
import { ProfileProvider, useProfile } from './ProfileContext';
import { DesignProvider } from './DesignContext';
import { PregnancyProvider } from './PregnancyContext';
import { PremiumProvider } from './PremiumContext';
import { SnackbarProvider } from './SnackbarContext';

function PregnancyProviderWrapper({ children }: { children: React.ReactNode }) {
  const { profile, isLoaded: profileLoaded } = useProfile();
  return (
    <PregnancyProvider profile={profile} profileLoaded={profileLoaded}>
      {children}
    </PregnancyProvider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <PregnancyProviderWrapper>
        <DesignProvider>
          <PremiumProvider>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </PremiumProvider>
        </DesignProvider>
      </PregnancyProviderWrapper>
    </ProfileProvider>
  );
}
