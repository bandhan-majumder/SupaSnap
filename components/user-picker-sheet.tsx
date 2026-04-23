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
  isUser,
}: any) {
  return (
    <View>
      <TextInput
        placeholder="Search by username.."
        placeholderTextColor={theme.icon}
        value={searchUserName}
        onChangeText={setSearchUserName}
        onSubmitEditing={handleSearch}
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 12,
          backgroundColor: theme.background,
          color: theme.text,
        }}
      />

      <TouchableOpacity
        onPress={handleSearch}
        style={{
          marginTop: 10,
          padding: 14,
          borderRadius: 12,
          backgroundColor: theme.supaPrimary,
          alignItems: "center",
        }}
      >
        {searching ? <ActivityIndicator /> : <Text>Search</Text>}
      </TouchableOpacity>

      {searchResult && (
        <View>
          <Text
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Results
          </Text>
          <TouchableOpacity
            onPress={handleStartChat}
            style={styles.avatarContainer}
          >
            {searchResult.avatar_url ? (
              <Image
                source={{ uri: searchResult.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View
                style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}
              >
                <Text style={styles.avatarText}>{searchResult.username}</Text>
              </View>
            )}
            <Text style={{ color: theme.text }}>@{isUser ? 'you' : searchResult.username }</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserSelect(item)}>
            <Text style={{ color: theme.text }}>{item.username}</Text>
          </TouchableOpacity>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
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
    width: 40,
    height: 40,
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
