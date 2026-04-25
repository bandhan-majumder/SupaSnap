import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import MediaViewer from "@/components/chat-media-viewer";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useMessages } from "@/hooks/use-chats";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Message } from "@/types/message";

const MEDIA_SIZE = Dimensions.get("window").width * 0.6;

const ImageMessage = React.memo(
  ({ uri, onPress }: { uri: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri }}
        style={styles.mediaThumbnail}
        contentFit="cover"
      />
    </TouchableOpacity>
  ),
);

const VideoMessage = React.memo(
  ({ uri, onPress }: { uri: string; onPress: () => void }) => {
    const player = useVideoPlayer(uri, (p) => {
      p.muted = true;
      p.loop = false;
    });

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.videoWrapper}
      >
        <VideoView
          player={player}
          style={styles.mediaThumbnail}
          allowsFullscreen={false}
          nativeControls={false}
        />
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const MessageItem = React.memo(
  ({
    item,
    isOwn,
    showDate,
    formatDate,
    formatTime,
    theme,
    colorScheme,
    onMediaPress,
  }: any) => {
    const isMedia = item.type === "media";
    const isImage = isMedia && item.media_type === "image";
    const isVideo = isMedia && item.media_type === "video";

    return (
      <>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: theme.icon }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        )}

        <View
          style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}
        >
          <View
            style={[
              styles.messageBubble,
              isOwn
                ? { backgroundColor: theme.supaPrimary, borderBottomRightRadius: 4 }
                : { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#e5e5e5", borderBottomLeftRadius: 4 },
              isMedia && styles.mediaBubble,
            ]}
          >
            {/* ── Media with overlaid timestamp ── */}
            {isImage && (
              <View style={styles.mediaWrapper}>
                <ImageMessage
                  uri={item.content}
                  onPress={() => onMediaPress(item.content, "image")}
                />
                <View style={styles.mediaTimeOverlay}>
                  <Text style={styles.mediaTimeOverlayText}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            )}
            {isVideo && (
              <View style={styles.mediaWrapper}>
                <VideoMessage
                  uri={item.content}
                  onPress={() => onMediaPress(item.content, "video")}
                />
                <View style={styles.mediaTimeOverlay}>
                  <Text style={styles.mediaTimeOverlayText}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            )}

            {/* ── Text with timestamp below ── */}
            {!isMedia && (
              <>
                <Text
                  style={[
                    styles.messageText,
                    { color: isOwn ? "#000" : theme.text },
                  ]}
                >
                  {item.content}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    { color: isOwn ? "rgba(0,0,0,0.5)" : theme.icon },
                  ]}
                >
                  {formatTime(item.created_at)}
                </Text>
              </>
            )}
          </View>
        </View>
      </>
    );
  },
);

export default function ChatRoomScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const currentUserId = user?.id;
  const { messages, loading, sendMessage } = useMessages(id || null);

  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState("");
  const [viewerType, setViewerType] = useState<"image" | "video">("image");

  const flatListRef = useRef<FlatList>(null);

  const handleMediaPress = useCallback(
    (uri: string, type: "image" | "video") => {
      setViewerUri(uri);
      setViewerType(type);
      setViewerVisible(true);
    },
    [],
  );

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    setSending(true);
    const success = await sendMessage(messageText);
    if (success) setMessageText("");
    setSending(false);
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === now.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    //@ts-ignore
    const current = new Date(messages[index].created_at).toDateString();
    //@ts-ignore
    const prev = new Date(messages[index - 1].created_at).toDateString();
    return current !== prev;
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageItem
        item={item}
        isOwn={item.sender_id === currentUserId}
        showDate={shouldShowDate(index)}
        formatDate={formatDate}
        formatTime={formatTime}
        theme={theme}
        colorScheme={colorScheme}
        onMediaPress={handleMediaPress}
      />
    ),
    [messages, currentUserId, theme, colorScheme, handleMediaPress],
  );

  const getOtherUserName = () => {
    for (const m of messages) {
      //@ts-ignore
      if (m.sender_id !== currentUserId && m.sender?.username) {
        //@ts-ignore
        return m.sender.username;
      }
    }
    return "";
  };

  if (!id) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Invalid conversation</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: getOtherUserName(),
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />
      <View
        style={{
          height: 1,
          backgroundColor: "#878484",
          width: "100%",
          marginVertical: 10,
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["bottom"]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.tint} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews
              // onContentSizeChange={() =>
              //   flatListRef.current?.scrollToEnd({ animated: true })
              // }
              inverted 
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={64}
                    color={theme.icon}
                  />
                  <Text style={[styles.emptyText, { color: theme.icon }]}>
                    {t("chat.noMessagesYet")}
                  </Text>
                </View>
              }
            />
          )}

          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1a1a1a" : "#f0f0f0",
                  color: theme.text,
                },
              ]}
              placeholder={t("chat.typeMessage")}
              placeholderTextColor={theme.icon}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: theme.supaPrimary },
              ]}
              onPress={handleSend}
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="send" size={20} color="#000" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <MediaViewer
        visible={viewerVisible}
        uri={viewerUri}
        mediaType={viewerType}
        onClose={() => setViewerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  messagesList: { padding: 16, flexGrow: 1, flexDirection: 'column-reverse' },

  emptyContainer: { alignItems: "center", marginTop: 100 },

  emptyText: { fontSize: 18, marginTop: 16 },

  dateContainer: { alignItems: "center", marginVertical: 16 },

  dateText: { fontSize: 12 },

  messageContainer: { marginVertical: 4, alignItems: "flex-start" },

  ownMessageContainer: { alignItems: "flex-end" },

  messageBubble: { maxWidth: "80%", padding: 8, borderRadius: 16 },
  mediaBubble: { padding: 4 },

  messageText: { fontSize: 16 },

  mediaThumbnail: {
    width: MEDIA_SIZE,
    height: MEDIA_SIZE,
    borderRadius: 12,
  },

  videoWrapper: {
    width: MEDIA_SIZE,
    height: MEDIA_SIZE,
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  mediaTimeText: { marginTop: 6, marginRight: 4, marginBottom: 2 },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", padding: 12 },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  mediaWrapper: {
    position: "relative",
  },
  mediaTimeOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  mediaTimeOverlayText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 10,
    marginTop: 2,
    alignSelf: "flex-end",
    opacity: 0.6,
  },
});
