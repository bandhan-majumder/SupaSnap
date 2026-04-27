import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, useColorScheme, View } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();

  const theme = Colors[colorScheme ?? "light"];

  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href={"/auth" as any} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "#121212",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: "#121212",
        },
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
