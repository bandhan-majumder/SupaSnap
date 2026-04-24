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

interface PermissionTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  granted: boolean | undefined;
  onRequest: () => void;
  isDark: boolean;
}

function PermissionTile({ icon, label, granted, onRequest, isDark }: PermissionTileProps) {
  const isGranted = granted === true;
  const isPending = granted === undefined;

  const iconColor = isGranted
    ? "#F6C15A"
    : isDark ? "#3a3a3a" : "#c8cdd8";

  const tileBackground = isDark ? "#1a1a1a" : "#eef0f5";

  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: tileBackground }]}
      onPress={onRequest}
      disabled={isGranted}
      activeOpacity={0.7}
    >
      {isPending ? (
        <ActivityIndicator size="small" color={isDark ? "#3a3a3a" : "#c8cdd8"} />
      ) : (
        <Ionicons name={icon} size={28} color={iconColor} />
      )}
      <Text style={[styles.tileLabel, { color: isGranted ? "#F6C15A" : isDark ? "#3a3a3a" : "#b0b5c0" }]}>
        {label}
      </Text>
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
    if (allGranted) onComplete();
  }, []);

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

  const username = userEmail?.split("@")[0] || "there";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.inner}>

        <View style={styles.top}>
          <Text style={[styles.greeting, { color: isDark ? "#444" : "#bbb" }]}>
            Hey, {username}
          </Text>
          <Text style={[styles.heading, { color: theme.text }]}>
            One last step
          </Text>
          <Text style={[styles.subheading, { color: isDark ? "#555" : "#bbb" }]}>
            Tap each icon below to grant access,{"\n"}or allow all at once.
          </Text>
        </View>

        <View style={styles.tilesRow}>
          <PermissionTile
            icon="camera-outline"
            label="Camera"
            granted={cameraPermissions?.granted}
            onRequest={requestCameraPermission}
            isDark={isDark}
          />
          <PermissionTile
            icon="mic-outline"
            label="Microphone"
            granted={microphonePermissions?.granted}
            onRequest={requestMicrophonePermission}
            isDark={isDark}
          />
          <PermissionTile
            icon="images-outline"
            label="Photos"
            granted={mediaPermissions?.granted}
            onRequest={requestMediaPermission}
            isDark={isDark}
          />
        </View>

      </View>

      <View style={[styles.footer, { borderTopColor: isDark ? "#1a1a1a" : "#f0f0f0" }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: '#D8B38A' },
            isRequesting && { opacity: 0.6 },
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          {isRequesting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 40,
  },
  top: {
    gap: 6,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  tilesRow: {
    flexDirection: "row",
    gap: 14,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  button: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
});