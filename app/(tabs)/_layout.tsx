import { theme } from "@/constants/theme";
import { useAuth } from "@/hooks/auth-context";
import { Tabs, useRouter } from "expo-router";
import { Calendar, Home, Map, Settings, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import AIAssistant from "@/components/AIAssistant";

const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.colors.background 
  }}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

const TAB_SCREENS = [
  {
    name: "index",
    title: "Events",
    icon: Home,
  },
  {
    name: "map",
    title: "Map",
    icon: Map,
  },
  {
    name: "my-events",
    title: "My Events",
    icon: Calendar,
  },
  {
    name: "profile",
    title: "Profile",
    icon: User,
  },
  {
    name: "settings",
    title: "Settings",
    icon: Settings,
  },
] as const;

const getTabScreenOptions = () => ({
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textMuted,
  tabBarStyle: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.cardBorder,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBarItemStyle: {
    paddingVertical: 4,
  },
  headerStyle: {
    backgroundColor: theme.colors.background,
  },
  headerTintColor: theme.colors.text,
  headerTitleStyle: {
    fontWeight: '700',
  },
  // Smooth transitions between tabs
  tabBarHideOnKeyboard: true,
  tabBarVisibilityAnimationConfig: {
    show: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
    hide: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
  },
  // Screen transition animations
  animation: 'fade',
  animationDuration: 250,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
});

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isNavigating) {
      setIsNavigating(true);
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    }
  }, [isAuthenticated, isLoading, isNavigating, router]);

  if (isLoading || (!isAuthenticated && !isNavigating)) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <React.Fragment>
      <Tabs screenOptions={getTabScreenOptions()}>
        {TAB_SCREENS.map(({ name, title, icon: Icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              tabBarIcon: ({ color }) => <Icon size={24} color={color} />,
            }}
          />
        ))}
      </Tabs>
      <AIAssistant />
    </React.Fragment>
  );
}