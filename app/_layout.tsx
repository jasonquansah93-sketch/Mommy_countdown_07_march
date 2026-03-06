import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from '../hooks/useAppFonts';
import { AppProvider } from '../context/AppProvider';
import { heartbeatPulse } from '../utils/haptics';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      // Heartbeat on initial launch
      heartbeatPulse();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Heartbeat every time app comes to foreground
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') heartbeatPulse();
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal/add-moment"
          options={{ presentation: 'modal', headerShown: true, title: 'Add Moment' }}
        />
        <Stack.Screen
          name="modal/moment-detail"
          options={{ presentation: 'modal', headerShown: true, title: 'Moment' }}
        />
        <Stack.Screen
          name="modal/milestone"
          options={{ presentation: 'modal', headerShown: true, title: 'Milestone' }}
        />
        <Stack.Screen
          name="modal/all-moments"
          options={{ presentation: 'modal', headerShown: true, title: 'All Moments' }}
        />
        <Stack.Screen
          name="modal/paywall"
          options={{ presentation: 'fullScreenModal', headerShown: false }}
        />
        <Stack.Screen
          name="modal/ambient"
          options={{ presentation: 'fullScreenModal', headerShown: false }}
        />
        <Stack.Screen
          name="video-wizard"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </AppProvider>
  );
}
