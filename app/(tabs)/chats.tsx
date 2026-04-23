import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useConversations,
  useProfiles,
  ChatRoom,
  Profile,
} from "@/hooks/useChats";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AppBottomSheet, { BottomSheetMethods } from "@/components/bottom-sheet";
import UserPickerSheet from "@/components/user-picker-sheet";

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const currentUserId = user?.id ?? "";

  const {
    conversations,
    loading: convLoading,
    startConversation,
  } = useConversations();

  const { loading: profilesLoading, searchByUsername } = useProfiles();

  const [searchUserName, setSearchUserName] = useState("");
  const [searchResult, setSearchResult] = useState<Profile | null>(null);
  const [searching, setSearching] = useState(false);

  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  const handleSearch = async () => {
    if (!searchUserName.trim()) return;
    setSearching(true);
    const result = await searchByUsername(searchUserName.trim());
    setSearchResult(result);
    setSearching(false);
  };

  const handleStartChat = async () => {
    if (!searchResult || searchResult.id === currentUserId) {
      Alert.alert("Error", "Cannot start chat with yourself");
      return;
    }

    const conversationId = await startConversation(searchResult.id);

    if (conversationId) {
      router.push(`/chat/${conversationId}`);
    } else {
      Alert.alert("Error", "Failed to start conversation");
    }

    setSearchUserName("");
    setSearchResult(null);
  };

  const getDisplayName = (conv: ChatRoom) => {
    const other = conv.participants.find((p) => p.user?.id !== currentUserId);
    return other?.user?.full_name || other?.user?.username || "Unknown";
  };

  const getAvatarUrl = (conv: ChatRoom): string | null => {
    const other = conv.participants.find((p) => p.user?.id !== currentUserId);
    return other?.user?.avatar_url ?? null;
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderConversation = ({ item }: { item: ChatRoom }) => {
    const displayName = getDisplayName(item);
    const avatarUrl = getAvatarUrl(item);

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
        )}

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text
              style={[styles.userName, { color: theme.text }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {item.last_message && (
              <Text style={[styles.timeText, { color: theme.secondaryText }]}>
                {formatTime(item.last_message.created_at)}
              </Text>
            )}
          </View>

          {item.last_message ? (
            <Text
              style={[styles.lastMessage, { color: theme.secondaryText }]}
              numberOfLines={1}
            >
              {item.last_message.sender_id === currentUserId ? "You: " : ""}
              {item.last_message.content}
            </Text>
          ) : (
            <Text style={[styles.lastMessage, { color: theme.secondaryText }]}>
              No messages yet
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={56} color={theme.secondaryText} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No chats yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
        Tap the icon above to start a conversation
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Chats</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => bottomSheetRef.current?.open()}
        >
          <Ionicons name="person-add" size={20} color={theme.tint} />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {convLoading || profilesLoading ? (
        <ActivityIndicator
          size="large"
          color={theme.tint}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
      <AppBottomSheet ref={bottomSheetRef} snapPoints={[200, 500]}>
        <UserPickerSheet
          theme={theme}
          colorScheme={colorScheme}
          searchUserName={searchUserName}
          setSearchUserName={setSearchUserName}
          handleSearch={handleSearch}
          searching={searching}
          searchResult={searchResult}
          handleStartChat={handleStartChat}
          getInitials={getInitials}
          currentUserId={currentUserId}
        />
      </AppBottomSheet>
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
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  divider: {
    height: 1,
    width: "100%",
  },

  loader: {
    marginTop: 40,
  },

  listContent: {
    padding: 12,
    gap: 8,
    flexGrow: 1,
  },

  conversationItem: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  avatarText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
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
    marginRight: 8,
  },

  timeText: {
    fontSize: 12,
  },

  lastMessage: {
    fontSize: 14,
    marginTop: 3,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 8,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});