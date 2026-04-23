import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { usePermissions } from "expo-media-library";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";

interface PermissionItemProps {
  icon: string;
  title: string;
  description: string;
  granted: boolean | undefined;
  onRequest: () => void;
  theme: typeof Colors.light;
  isDark: boolean;
}

function PermissionItem({
  icon,
  title,
  description,
  granted,
  onRequest,
  theme,
  isDark,
}: PermissionItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.permissionItem,
        { backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" },
      ]}
      onPress={onRequest}
      disabled={granted === true}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: granted ? "#4CAF50" : theme.supaPrimary },
        ]}
      >
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

interface PermissionsScreenProps {
  onComplete: () => void;
  isDark: boolean;
  userEmail?: string | null;
}

export default function PermissionsScreen({
  onComplete,
  isDark,
  userEmail,
}: PermissionsScreenProps) {
  const theme = isDark ? Colors.dark : Colors.light;

  const [cameraPermissions, requestCameraPermission] = useCameraPermissions();
  const [microphonePermissions, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaPermissions, requestMediaPermission] = usePermissions();
  const [isRequesting, setIsRequesting] = useState(false);

  const allGranted =
    cameraPermissions?.granted &&
    microphonePermissions?.granted &&
    mediaPermissions?.granted;

  useEffect(() => {
    if (allGranted) {
      onComplete();
    }
  }, [])

  async function requestAllPermissions() {
    const camera = await requestCameraPermission();
    if (!camera?.granted && camera?.canAskAgain === false) return false;

    const mic = await requestMicrophonePermission();
    if (!mic?.granted && mic?.canAskAgain === false) return false;

    const media = await requestMediaPermission();
    if (!media?.granted && media?.canAskAgain === false) return false;

    return camera?.granted && mic?.granted && media?.granted;
  }

  async function handleContinue() {
    if (allGranted) {
      onComplete();
      return;
    }

    setIsRequesting(true);
    const granted = await requestAllPermissions();
    setIsRequesting(false);

    if (granted) {
      onComplete();
    } else {
      Alert.alert(
        "Permissions Required",
        "Please grant all permissions in your device settings to use this app.",
        [{ text: "OK" }]
      );
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { borderColor: theme.supaPrimary }]}>
            <Ionicons name="camera" size={40} color={theme.supaPrimary} />
          </View>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            Hi, {userEmail?.split("@")[0] || "there"}!
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
              granted={microphonePermissions?.granted}
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
            !allGranted && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.continueButtonText}>
              {allGranted ? "Start Snapping!" : "Grant All Permissions"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: theme.icon }]}>
          {allGranted
            ? "You're all set! Tap to continue."
            : "Tap each permission to grant access"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
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
  subtitle: { fontSize: 16, textAlign: "center" },
  permissionsContainer: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  sectionDesc: { fontSize: 14, marginBottom: 20 },
  permissionsList: { gap: 12 },
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
  permissionInfo: { flex: 1, marginLeft: 14 },
  permissionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  permissionDesc: { fontSize: 13 },
  grantedText: { fontSize: 12, fontWeight: "600" },
  loadingIndicator: { width: 20, alignItems: "center" },
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
  continueButtonDisabled: { opacity: 0.6 },
  continueButtonText: { fontSize: 18, fontWeight: "600", color: "#000" },
  footerText: { marginTop: 16, fontSize: 13, textAlign: "center" },
});