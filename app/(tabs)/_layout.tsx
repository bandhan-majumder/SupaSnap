import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFirstTimeOpen } from '@/hooks/useFirstTimeOpen';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();
  const { isFirstTime, isLoading: permissionsLoading } = useFirstTimeOpen();
  const theme = Colors[colorScheme ?? 'light'];

  // Show loading indicator while checking auth
  if (authLoading || permissionsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  // Not logged in -> show auth screen
  if (!user) {
    return <Redirect href={"/auth" as any} />;
  }

  // Logged in but needs permissions -> show onboarding
  if (isFirstTime) {
    return <Redirect href={"/onboarding"} />;
  }

  // Logged in and permissions granted -> show main app with tabs
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name={"camera"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
