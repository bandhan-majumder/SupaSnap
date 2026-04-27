import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ColorSchemeName } from "react-native";
import { Colors } from "@/constants/theme";
import { Profile } from "@/types/profile";

const DEBOUNCE_MS = 500;

interface UserPickerSheetProps {
  theme: typeof Colors.light;
  colorScheme: ColorSchemeName;
  searchUserName: string;
  setSearchUserName: (value: string) => void;
  handleSearch: () => Promise<void>;
  searching: boolean;
  searchResult: Profile | null | "not_found";
  handleStartChat: () => Promise<void>;
  profiles?: Profile[];
  handleUserSelect?: (profile: Profile) => void;
  getInitials: (name: string) => string;
  currentUserId: string;
}

export default function UserPickerSheet({
  theme,
  searchUserName,
  setSearchUserName,
  handleSearch,
  searching,
  searchResult,
  handleStartChat,
  profiles,
  handleUserSelect,
  getInitials,
  currentUserId,
}: UserPickerSheetProps) {
  const { t } = useTranslation();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchUserName.trim()) return;

    debounceTimer.current = setTimeout(() => {
      handleSearch();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchUserName]);

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          placeholder={t("chat.searchPlaceholder")}
          placeholderTextColor={theme.icon}
          value={searchUserName}
          onChangeText={setSearchUserName}
          onSubmitEditing={handleSearch}
          style={[
            styles.input,
            { backgroundColor: theme.background, color: theme.text, flex: 1 },
          ]}
        />
        <TouchableOpacity
          disabled={searchUserName.length === 0 || searching}
          onPress={handleSearch}
          style={[
            styles.searchIconButton,
            {
              backgroundColor: theme.supaPrimary,
              opacity: searchUserName.length === 0 ? 0.5 : 1,
            },
          ]}
        >
          {searching ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="search" size={18} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {searchUserName.trim() !== "" && searchResult === "not_found" && !searching && (
        <View style={styles.notFoundContainer}>
          <Ionicons name="person-outline" size={32} color={theme.icon} />
          <Text style={[styles.notFoundText, { color: theme.secondaryText }]}>
            No results for "{searchUserName}"
          </Text>
        </View>
      )}

      {searchResult !== null && searchResult !== "not_found" && (
        <View
          style={[
            styles.resultContainer,
            { borderColor: theme.border ?? "#eee" },
          ]}
        >
          <Text style={[styles.resultsLabel, { color: theme.icon }]}>
            {t("chat.results")}
          </Text>
          <TouchableOpacity onPress={handleStartChat} style={styles.resultRow}>
            {searchResult.avatar_url ? (
              <Image
                source={{ uri: searchResult.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {getInitials(searchResult.username || "")}
                </Text>
              </View>
            )}
            <View style={styles.resultInfo}>
              <Text style={[styles.resultUsername, { color: theme.text }]}>
                {searchResult.id === currentUserId ? "You" : searchResult.username}
              </Text>
              <Text style={[styles.resultHandle, { color: theme.icon }]}>
                @{searchResult.username}
              </Text>
            </View>
            {searchResult.id !== currentUserId && (
              <View style={styles.chatBadge}>
                <Ionicons name="chatbubble" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleUserSelect?.(item)}
            style={[
              styles.profileRow,
              { borderBottomColor: theme.border ?? "#eee" },
            ]}
          >
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.profileAvatar} />
            ) : (
              <View
                style={[
                  styles.profileAvatarFallback,
                  { backgroundColor: theme.supaPrimary },
                ]}
              >
                <Text style={styles.avatarInitials}>
                  {getInitials(item.username || "")}
                </Text>
              </View>
            )}
            <Text style={[styles.profileUsername, { color: theme.text }]}>
              {item.username}
            </Text>
          </TouchableOpacity>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  searchIconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundContainer: {
    marginTop: 24,
    alignItems: "center",
    gap: 8,
  },
  notFoundText: {
    fontSize: 14,
    textAlign: "center",
  },
  resultContainer: {
    marginTop: 16,
    borderRadius: 14,
    padding: 12,
  },
  resultsLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultUsername: {
    fontSize: 15,
    fontWeight: "600",
  },
  resultHandle: {
    fontSize: 13,
  },
  chatBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  profileUsername: {
    fontSize: 15,
    fontWeight: "500",
  },
});
