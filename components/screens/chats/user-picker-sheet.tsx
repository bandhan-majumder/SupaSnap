import React from "react";
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
}: any) {
  const { t } = useTranslation();

  return (
    <View>
      <TextInput
        placeholder={t("chat.searchPlaceholder")}
        placeholderTextColor={theme.icon}
        value={searchUserName}
        onChangeText={setSearchUserName}
        onSubmitEditing={handleSearch}
        style={[
          styles.input,
          { backgroundColor: theme.background, color: theme.text },
        ]}
      />

      <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
        {searching ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.searchButtonText}>{t("chat.search")}</Text>
        )}
      </TouchableOpacity>

      {searchResult && (
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
              <View style={[styles.avatarFallback]}>
                <Text style={styles.avatarInitials}>
                  {getInitials(searchResult.username)}
                </Text>
              </View>
            )}
            <View style={styles.resultInfo}>
              <Text style={[styles.resultUsername, { color: theme.text }]}>
                {searchResult.id === currentUserId
                  ? "You"
                  : searchResult.username}
              </Text>
              <Text style={[styles.resultHandle, { color: theme.icon }]}>
                @{searchResult.username}
              </Text>
            </View>
            {!searchResult.id === currentUserId && <View style={[styles.chatBadge]}>
              <Ionicons name="chatbubble" size={18} color="#fff" />
            </View>}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleUserSelect(item)}
            style={[
              styles.profileRow,
              { borderBottomColor: theme.border ?? "#eee" },
            ]}
          >
            {item.avatar_url ? (
              <Image
                source={{ uri: item.avatar_url }}
                style={styles.profileAvatar}
              />
            ) : (
              <View
                style={[
                  styles.profileAvatarFallback,
                  { backgroundColor: theme.supaPrimary },
                ]}
              >
                <Text style={styles.avatarInitials}>
                  {getInitials(item.username)}
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
  input: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  searchButton: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#D8B38A",
    alignItems: "center",
  },
  searchButtonText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#fff",
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
