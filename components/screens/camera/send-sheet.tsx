import AppBottomSheet, {
  BottomSheetMethods,
} from "@/components/common/bottom-sheet";
import { Colors } from "@/constants/theme";
import { useConversations, useMessages } from "@/hooks/use-chats";
import { useUpload } from "@/hooks/use-upload";
import { getAvatarUrl, getDisplayName, getInitials } from "@/lib/utils";
import { ChatRoom } from "@/types/room";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

export interface SendSheetRef {
  open: (
    fileUri: string,
    isVideo: boolean,
    userId: string,
    mediaType: "video" | "image" | undefined,
  ) => void;
}

const SendSheet = React.forwardRef<SendSheetRef>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  const { t } = useTranslation();
  const { conversations } = useConversations();
  const { uploadMediaAndReturnSignedUrl } = useUpload();

  const [fileUri, setFileUri] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image">();

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  React.useImperativeHandle(ref, () => ({
    open: (
      uri: string,
      video: boolean,
      uid: string,
      mediaType: "video" | "image" | undefined,
    ) => {
      setFileUri(uri);
      setUserId(uid);
      setIsVideo(video);
      setMediaType(mediaType);
      bottomSheetRef.current?.open();
    },
  }));

  const handleSend = async (
    fileUriToSend: string,
    conversationId: string,
    sendMessageFn: (
      url: string,
      type: "text" | "media",
      mediaType: "video" | "image" | undefined,
    ) => Promise<boolean>,
  ) => {
    setSendingId(conversationId);

    const signedUrl = await uploadMediaAndReturnSignedUrl({
      isVideo,
      fileUri: fileUriToSend,
    });

    if (!signedUrl) {
      setSendingId(null);
      Alert.alert(t("camera.failedToSend"));
      return;
    }

    const message = await sendMessageFn(signedUrl, "media", mediaType);

    if (!message) {
      setSendingId(null);
      Alert.alert(t("camera.failedToSendMessage"));
      return;
    }

    setSendingId(null);
    bottomSheetRef.current?.close();
    Alert.alert(t("camera.sent"));
  };

  const renderConversation = ({ item }: { item: ChatRoom }) => {
    if (!userId) return null;

    return (
      <ConversationRow
        item={item}
        userId={userId}
        isVideo={isVideo}
        fileUri={fileUri}
        theme={theme}
        sendingId={sendingId}
        onSend={handleSend}
      />
    );
  };

  const ConversationRow = React.memo(
    ({
      item,
      userId,
      isVideo,
      fileUri,
      theme,
      sendingId,
      onSend,
    }: {
      item: ChatRoom;
      userId: string;
      isVideo: boolean;
      fileUri: string | null;
      theme: typeof Colors.light;
      sendingId: string | null;
      onSend: (
        fileUri: string,
        conversationId: string,
        sendMessageFn: (
          url: string,
          type: "text" | "media",
          mediaType: "image" | "video" | undefined,
        ) => Promise<boolean>,
      ) => void;
    }) => {
      const displayName = getDisplayName(item, userId);
      const avatarUrl = getAvatarUrl(item, userId);

      const { sendMessage } = useMessages(item.id, userId);

      const handleSendPress = () => {
        if (!fileUri) return;
        onSend(fileUri, item.id, sendMessage);
      };

      const isSending = sendingId === item.id;

      return (
        <View
          style={[
            styles.row,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}
            >
              <Text style={styles.avatarText}>
                {getInitials(displayName)}
              </Text>
            </View>
          )}

          <Text style={[styles.name, { color: theme.text }]}>
            {displayName}
          </Text>

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSendPress}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      );
    },
  );

  return (
    <AppBottomSheet ref={bottomSheetRef} snapPoints={[250, 500]}>
      {!userId ? (
        <View style={{ padding: 20 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={[styles.header, { color: theme.text }]}>
              Send your snap to friends
            </Text>
          }
        />
      )}
    </AppBottomSheet>
  );
});

export default SendSheet;

const styles = StyleSheet.create({
  list: {
    padding: 12,
    gap: 10,
  },

  header: {
    fontSize: 17,
    marginBottom: 10,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontWeight: "600",
  },

  name: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },

  sendBtn: {
    backgroundColor: "#D8B38A",
    padding: 10,
    borderRadius: 20,
  },
});
