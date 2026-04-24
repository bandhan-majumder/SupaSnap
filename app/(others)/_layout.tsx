import { Stack } from "expo-router";

export default function RootLayout() {
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
     <Stack.Screen
        name="terms"
        options={{ title: "Terms & Privacy" }}
      />
    </Stack>
  );
}