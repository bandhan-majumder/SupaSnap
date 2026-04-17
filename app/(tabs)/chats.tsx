import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useConversations, useProfiles, Conversation, Profile } from "@/hooks/useChats";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const DEMO_USER_ID = "user1";

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const currentUserId = user?.id || DEMO_USER_ID;

  const { conversations, loading: convLoading, startConversation, refetch } = useConversations();
  const { profiles, loading: profilesLoading, searchByEmail } = useProfiles();

  const [showUserModal, setShowUserModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<Profile | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setSearching(true);
    const result = await searchByEmail(searchEmail.trim());
    setSearchResult(result);
    setSearching(false);
  };

  const handleStartChat = async () => {
    if (!searchResult || searchResult.id === currentUserId) {
      Alert.alert("Error", "Cannot start chat with yourself");
      return;
    }

    setShowUserModal(false);
    setSearchEmail("");
    setSearchResult(null);

    const conversationId = await startConversation(searchResult.id);
    if (conversationId) {
      router.push(`/chat/${conversationId}`);
    } else {
      Alert.alert("Error", "Failed to start conversation");
    }
  };

  const handleUserSelect = async (profile: Profile) => {
    if (profile.id === currentUserId) return;
    const conversationId = await startConversation(profile.id);
    if (conversationId) {
      router.push(`/chat/${conversationId}`);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getDisplayName = (conv: Conversation) => {
    const other = conv.participants?.find((p) => p.id !== currentUserId);
    return other?.display_name || other?.email || "Unknown";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { borderBottomColor: theme.background }]}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}>
        <Text style={styles.avatarText}>{getInitials(getDisplayName(item))}</Text>
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
            {getDisplayName(item)}
          </Text>
          {item.last_message && (
            <Text style={[styles.timeText, { color: theme.icon }]}>
              {formatTime(item.last_message.created_at)}
            </Text>
          )}
        </View>
        {item.last_message && (
          <Text style={[styles.lastMessage, { color: theme.icon }]} numberOfLines={1}>
            {item.last_message.sender_id === currentUserId ? "You: " : ""}
            {item.last_message.content}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Chats</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowUserModal(true)}>
          <Ionicons name="person-add" size={24} color={theme.tint} />
        </TouchableOpacity>
      </View>

      {convLoading || profilesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No conversations yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.icon }]}>
                Tap the + button to start chatting
              </Text>
            </View>
          }
        />
      )}

      <Modal visible={showUserModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Start New Chat</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f0f0f0",
                  color: theme.text,
                },
              ]}
              placeholder="Search by email..."
              placeholderTextColor={theme.icon}
              value={searchEmail}
              onChangeText={setSearchEmail}
              onSubmitEditing={handleSearch}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: theme.supaPrimary }]}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>

            {searchResult && (
              <TouchableOpacity style={styles.userResult} onPress={handleStartChat}>
                <View style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}>
                  <Text style={styles.avatarText}>
                    {getInitials(searchResult.display_name || searchResult.email || "")}
                  </Text>
                </View>
                <View style={styles.userResultInfo}>
                  <Text style={[styles.userName, { color: theme.text }]}>
                    {searchResult.display_name || "No name"}
                  </Text>
                  <Text style={[styles.userEmail, { color: theme.icon }]}>{searchResult.email}</Text>
                </View>
                <Ionicons name="chatbubble" size={24} color={theme.tint} />
              </TouchableOpacity>
            )}

            {searchResult === null && searchEmail.length > 0 && !searching && (
              <Text style={[styles.noResult, { color: theme.icon }]}>User not found</Text>
            )}

            <Text style={[styles.orText, { color: theme.icon }]}>Or select from all users</Text>

            <FlatList
              data={profiles}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.userItem} onPress={() => handleUserSelect(item)}>
                  <View style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}>
                    <Text style={styles.avatarText}>
                      {getInitials(item.display_name || item.email || "")}
                    </Text>
                  </View>
                  <View style={styles.userResultInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>
                      {item.display_name || "No name"}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.icon }]}>{item.email}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              style={styles.userList}
            />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  userResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
  },
  userResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  noResult: {
    textAlign: "center",
    marginTop: 16,
  },
  orText: {
    textAlign: "center",
    marginVertical: 16,
  },
  userList: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
});
