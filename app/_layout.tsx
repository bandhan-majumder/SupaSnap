import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import "react-native-reanimated";
//FIXME: not sure if this is a good place to import this css file
import '../global.css'

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(others)" options={{ headerShown: false }} />
            <Stack.Screen
              name="onboarding"
              options={{
                presentation: "fullScreenModal",
                headerShown: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                presentation: "fullScreenModal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="media-library"
              options={{ presentation: "modal" }}
            />
          </Stack>

          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
