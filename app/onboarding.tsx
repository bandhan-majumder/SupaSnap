import PermissionsScreen from "@/components/permissions-check";
import UsernameSetup from "@/components/username-setup";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProfile } from "@/hooks/use-profile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "loading" | "username" | "permissions";

export default function OnboardingScreen() {
  const { user, loading: authLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const { getProfile } = useProfile();
  const [step, setStep] = useState<Step>("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth" as any);
      return;
    }

    const determineStep = async () => {
      const { data, error } = await getProfile();
      if (!error && data && !data.username) {
        setStep("username");
      } else {
        setStep("permissions");
      }
    };

    determineStep();
  }, [authLoading, user]);

  async function handlePermissionsComplete() {
    await AsyncStorage.setItem("hasOpened", "true");
    router.replace("/(tabs)");
  }

  if (step === "loading") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === "username") {
    return (
      <UsernameSetup
        isDark={isDark}
        onComplete={() => setStep("permissions")}
      />
    );
  }

  return (
    <PermissionsScreen
      isDark={isDark}
      userEmail={user?.email}
      onComplete={handlePermissionsComplete}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
