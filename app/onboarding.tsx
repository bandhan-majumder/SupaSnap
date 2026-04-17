import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { usePermissions } from "expo-media-library";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

interface PermissionItemProps {
  icon: string;
  title: string;
  description: string;
  granted: boolean | undefined;
  onRequest: () => void;
  theme: typeof Colors.light;
}

function PermissionItem({ icon, title, description, granted, onRequest, theme, isDark }: PermissionItemProps & { isDark: boolean }) {
  return (
    <TouchableOpacity
      style={[
        styles.permissionItem,
        { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" },
      ]}
      onPress={onRequest}
      disabled={granted === true}
    >
      <View style={[styles.iconContainer, { backgroundColor: granted ? "#4CAF50" : theme.supaPrimary }]}>
        {granted ? (
          <Ionicons name="checkmark" size={20} color="#fff" />
        ) : (
          <Ionicons name={icon as any} size={20} color="#000" />
        )}
      </View>
      <View style={styles.permissionInfo}>
        <Text style={[styles.permissionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.permissionDesc, { color: theme.icon }]}>{description}</Text>
      </View>
      {granted === true ? (
        <Text style={[styles.grantedText, { color: "#4CAF50" }]}>Granted</Text>
      ) : granted === false ? (
        <Text style={[styles.grantedText, { color: "#f44336" }]}>Denied</Text>
      ) : (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color={theme.tint} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function OnboardingScreen() {
  const { user, loading: authLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const [cameraPermissions, requestCameraPermission] = useCameraPermissions();
  const [microPhonePermissions, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaPermissions, requestMediaPermission] = usePermissions();
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth" as any);
    }
  }, [authLoading, user]);

  const allPermissionsGranted =
    cameraPermissions?.granted &&
    microPhonePermissions?.granted &&
    mediaPermissions?.granted;

  async function handleContinue() {
    if (allPermissionsGranted) {
      await AsyncStorage.setItem("hasOpened", "true");
      router.replace("/(tabs)");
      return;
    }

    setIsRequesting(true);
    const allGranted = await requestAllPermissions();
    setIsRequesting(false);

    if (allGranted) {
      await AsyncStorage.setItem("hasOpened", "true");
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Permissions Required",
        "Please grant all permissions in your device settings to use this app.",
        [{ text: "OK" }]
      );
    }
  }

  async function requestAllPermissions() {
    const cameraStatus = await requestCameraPermission();
    if (!cameraStatus?.granted && cameraStatus?.canAskAgain === false) {
      return false;
    }

    const microPhoneStatus = await requestMicrophonePermission();
    if (!microPhoneStatus?.granted && microPhoneStatus?.canAskAgain === false) {
      return false;
    }

    const mediaStatus = await requestMediaPermission();
    if (!mediaStatus?.granted && mediaStatus?.canAskAgain === false) {
      return false;
    }

    return cameraStatus?.granted && microPhoneStatus?.granted && mediaStatus?.granted;
  }

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { borderColor: theme.supaPrimary }]}>
            <Ionicons name="camera" size={40} color={theme.supaPrimary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Welcome to SupaChat</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            Hi, {user?.email?.split("@")[0] || "there"}!
          </Text>
        </View>

        <View style={styles.permissionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Permissions Required
          </Text>
          <Text style={[styles.sectionDesc, { color: theme.icon }]}>
            We need a few permissions to make the app work perfectly
          </Text>

          <View style={styles.permissionsList}>
            <PermissionItem
              icon="camera"
              title="Camera"
              description="Take photos and videos"
              granted={cameraPermissions?.granted}
              onRequest={requestCameraPermission}
              theme={theme}
              isDark={isDark}
            />
            <PermissionItem
              icon="mic"
              title="Microphone"
              description="Record audio for videos"
              granted={microPhonePermissions?.granted}
              onRequest={requestMicrophonePermission}
              theme={theme}
              isDark={isDark}
            />
            <PermissionItem
              icon="images"
              title="Photo Library"
              description="Save and access your media"
              granted={mediaPermissions?.granted}
              onRequest={requestMediaPermission}
              theme={theme}
              isDark={isDark}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: theme.supaPrimary },
            !allPermissionsGranted && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.continueButtonText}>
              {allPermissionsGranted ? "Start Snapping!" : "Grant Permissions"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: theme.icon }]}>
          {allPermissionsGranted
            ? "You're all set! Tap to continue."
            : "Tap each permission to grant access"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  permissionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 20,
  },
  permissionsList: {
    gap: 12,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  permissionDesc: {
    fontSize: 13,
  },
  grantedText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingIndicator: {
    width: 20,
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: "center",
  },
  continueButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  footerText: {
    marginTop: 16,
    fontSize: 13,
    textAlign: "center",
  },
});
