import React from "react";
import {
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, loading, uploading, error, updateAvatar } = useProfile();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  React.useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  const handlePickImage = async () => {
    try {
      const ImagePicker = require("expo-image-picker");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant photo library access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const success = await updateAvatar(result.assets[0].uri);
        if (success) {
          Alert.alert("Success", "Profile picture updated!");
        } else {
          Alert.alert("Error", "Failed to update profile picture.");
        }
      }
    } catch (err) {
      console.log("Image picker error:", err);
      Alert.alert("Error", "Unable to pick image. Please try again.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/auth" as any);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={uploading}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: theme.tint }]}>
              {uploading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="camera" size={16} color="#000" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={[styles.displayName, { color: theme.text }]}>{displayName}</Text>
          <Text style={[styles.email, { color: theme.icon }]}>{user?.email}</Text>
          <Text style={[styles.tapHint, { color: theme.icon }]}>Tap camera icon to change photo</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" }]}>
            <Ionicons name="person-outline" size={22} color={theme.text} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>Profile Info</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>View your account details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" }]}>
            <Ionicons name="settings-outline" size={22} color={theme.text} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>Settings</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>App preferences and options</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={theme.text} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>Privacy</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>Control your privacy settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Support</Text>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" }]}>
            <Ionicons name="help-circle-outline" size={22} color={theme.text} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>Help Center</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>Get help and support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5" }]}>
            <Ionicons name="information-circle-outline" size={22} color={theme.text} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>About</Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>App version 1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: "#f44336" }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#f44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
  },
  editBadge: {
    position: "absolute",
    bottom: 18,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  tapHint: {
    fontSize: 12,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 14,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f44336",
    marginLeft: 8,
  },
});