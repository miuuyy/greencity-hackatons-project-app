import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { theme } from '@/constants/theme';
import { AIAssistantProvider } from '@/hooks/ai-assistant-context';
import { AuthProvider } from '@/hooks/auth-context';
import { EventsProvider } from '@/hooks/events-context';
import { VotesProvider } from '@/hooks/votes-context';


SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        // Плавные переходы между экранами
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ 
        title: "Event",
        presentation: "modal",
      }} />
      <Stack.Screen name="create-event" options={{ 
        title: "Create Event",
        presentation: "modal",
      }} />
      <Stack.Screen name="organizer" options={{ 
        title: "Organizer Panel",
        presentation: "modal",
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventsProvider>
          <VotesProvider>
            <AIAssistantProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </AIAssistantProvider>
          </VotesProvider>
        </EventsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

}