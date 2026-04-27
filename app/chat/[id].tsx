import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import MediaViewer from "@/components/chat-media-viewer";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useMessages } from "@/hooks/use-chats";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Message } from "@/types/message";
import { useCustomKeyboardAnimation } from "@/hooks/use-keyboard-animation";

const MEDIA_SIZE = Dimensions.get("window").width * 0.6;
const DEFAULT_BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

const ImageMessage = React.memo(
  ({
    uri,
    blurhash,
    onPress,
  }: {
    uri: string;
    blurhash?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri }}
        placeholder={{ blurhash: blurhash ?? DEFAULT_BLURHASH }}
        placeholderContentFit="cover"
        transition={300}
        style={styles.mediaThumbnail}
        contentFit="cover"
      />
    </TouchableOpacity>
  ),
);

const VideoMessage = React.memo(
  ({
    uri,
    blurhash,
    onPress,
  }: {
    uri: string;
    blurhash?: string;
    onPress: () => void;
  }) => {
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
        <Image
          source={null}
          placeholder={{ blurhash: blurhash ?? DEFAULT_BLURHASH }}
          placeholderContentFit="cover"
          style={[styles.mediaThumbnail, StyleSheet.absoluteFill]}
        />
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
  ({ item, isOwn, formatTime, theme, colorScheme, onMediaPress }: any) => {
    const isMedia = item.type === "media";
    const isImage = isMedia && item.media_type === "image";
    const isVideo = isMedia && item.media_type === "video";

    return (
      <>
        <View
          style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}
        >
          <View
            style={[
              styles.messageBubble,
              isOwn
                ? {
                    backgroundColor: theme.supaPrimary,
                    borderBottomRightRadius: 4,
                  }
                : {
                    backgroundColor:
                      colorScheme === "dark" ? "#2a2a2a" : "#e5e5e5",
                    borderBottomLeftRadius: 4,
                  },
              isMedia && styles.mediaBubble,
            ]}
          >
            {isImage && (
              <View style={styles.mediaWrapper}>
                <ImageMessage
                  uri={item.content}
                  blurhash={item.blurhash}
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
                  blurhash={item.blurhash}
                  onPress={() => onMediaPress(item.content, "video")}
                />
                <View style={styles.mediaTimeOverlay}>
                  <Text style={styles.mediaTimeOverlayText}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            )}
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
  const router = useRouter();

  const currentUserId = user?.id;
  const { messages, loading, sendMessage, isOtherUserOnline } = useMessages(
    id || null,
    user?.id || null,
  );

  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState("");
  const [viewerType, setViewerType] = useState<"image" | "video">("image");

  const flatListRef = useRef<FlatList>(null);
  const { height } = useCustomKeyboardAnimation();

  const keyBoardPadding = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  const otherUser = useMemo(() => {
    for (const m of messages) {
      //@ts-ignore
      if (m.sender_id !== currentUserId && m.sender) {
        //@ts-ignore
        return m.sender;
      }
    }
    return null;
  }, [messages, currentUserId]);

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

  // const formatDate = (dateStr: string) => {
  //   const date = new Date(dateStr);
  //   const now = new Date();
  //   const yesterday = new Date();
  //   yesterday.setDate(now.getDate() - 1);

  //   if (date.toDateString() === now.toDateString()) return "Today";
  //   if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  //   return date.toLocaleDateString([], {
  //     weekday: "long",
  //     month: "short",
  //     day: "numeric",
  //   });
  // };

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
        formatTime={formatTime}
        theme={theme}
        colorScheme={colorScheme}
        onMediaPress={handleMediaPress}
      />
    ),
    [messages, currentUserId, theme, colorScheme, handleMediaPress],
  );

  if (!id) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Invalid conversation</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["top"]}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: theme.background, borderBottomColor: "#878484" },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerUser}>
            {otherUser?.avatar_url ? (
              <Image
                source={{ uri: otherUser.avatar_url }}
                style={styles.headerAvatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
                <Ionicons name="person" size={18} color="#fff" />
              </View>
            )}
            <Text
              style={[styles.headerUsername, { color: theme.text }]}
              numberOfLines={1}
            >
              {otherUser?.username ?? ""}
            </Text>
            <Text
              style={[
                styles.status,
                { color: isOtherUserOnline ? "green" : "gray" },
              ]}
              numberOfLines={1}
            >
              {isOtherUserOnline ? "(online)" : "(offline)"}
            </Text>
          </View>
          <View style={styles.backButton} />
        </View>

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
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && { flex: 1, justifyContent: "center" },
            ]}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
            inverted
            automaticallyAdjustKeyboardInsets={true}
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
          style={[styles.inputContainer, { backgroundColor: "transparent" }]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f0f0f0",
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
            style={[styles.sendButton, { backgroundColor: theme.supaPrimary }]}
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
        <Animated.View style={keyBoardPadding} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerUser: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  headerAvatarFallback: {
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: "600",
    maxWidth: "70%",
  },

  status: {
    fontSize: 12,
    fontWeight: "400",
    maxWidth: "70%",
  },

  messagesList: { padding: 16, flexGrow: 1, flexDirection: "column-reverse" },

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

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
  },

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

  mediaWrapper: { position: "relative" },

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
