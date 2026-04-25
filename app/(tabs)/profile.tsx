import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProfile } from "@/hooks/use-profile";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    profile,
    loading,
    uploading,
    updating,
    error,
    updateProfile,
    updateAvatar,
  } = useProfile();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const displayName = "@" + profile?.username || "randomuse32";
  const initials = displayName.slice(1, 2).toUpperCase();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editFullName, setEditFullName] = useState("");

  const openEditModal = () => {
    setEditUsername(profile?.username || "");
    setEditFullName(profile?.full_name || "");
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile({
      username: editUsername.trim() || undefined,
      full_name: editFullName.trim() || undefined,
    });

    if (result.success) {
      setEditModalVisible(false);
      Alert.alert(t("common.success"), t("profile.profileUpdated"));
    } else {
      Alert.alert(
        t("common.error"),
        result.error || t("profile.failedToUpdateProfile"),
      );
    }
  };

  const handleProfileInfo = () => {
    openEditModal();
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
    }
  }, [error]);

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", t("profile.photoLibraryAccess"));
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"], // if we further support videos as well, we might want to check type in the handler too
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets?.[0]?.uri) {
        const success = await updateAvatar(result.assets[0].uri);
        if (success) {
          Alert.alert(t("common.success"), t("profile.profilePictureUpdated"));
        } else {
          Alert.alert(
            t("common.error"),
            t("profile.failedToUpdateProfilePicture"),
          );
        }
      }
    } catch (err) {
      console.log("Image picker error: ", err);
      Alert.alert(t("common.error"), t("profile.unableToPickImage"));
    }
  };

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.areYouSureYouWantToLogout"), [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth" as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["top"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={uploading}
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View
                style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}
              >
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
          <Text style={[styles.displayName, { color: theme.text }]}>
            {displayName}
          </Text>
          {profile?.full_name ? (
            <Text style={[styles.email, { color: theme.icon }]}>
              {profile.full_name}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleProfileInfo}>
              <Text style={[styles.email, { color: theme.tint }]}>
                Set up Full Name
              </Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.tapHint, { color: theme.icon }]}>
            Tap camera icon to change photo
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
              },
            ]}
            onPress={handleProfileInfo}
          >
            <Ionicons name="person-outline" size={22} color={theme.text} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                Profile Info
              </Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>
                View your account details
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
              },
            ]}
          >
            <Ionicons name="settings-outline" size={22} color={theme.text} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                Settings
              </Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>
                App preferences and options
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={theme.text}
            />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                Privacy={t("profile.privacy")}
              </Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>
                Control your privacy settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Support
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
              },
            ]}
          >
            <Ionicons name="help-circle-outline" size={22} color={theme.text} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                Help Center
              </Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>
                Get help and support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.text}
            />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                About
              </Text>
              <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>
                App version 1.0.0
              </Text>
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

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Edit Profile
            </Text>

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Username
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                  color: theme.text,
                },
              ]}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder={t("profile.enterUsername")}
              placeholderTextColor={theme.icon}
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Full Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                  color: theme.text,
                },
              ]}
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder={t("profile.enterFullName")}
              placeholderTextColor={theme.icon}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                  },
                ]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.tint }]}
                onPress={handleSaveProfile}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: "#000" }]}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
