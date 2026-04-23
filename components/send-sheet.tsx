import React, { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import AppBottomSheet, { BottomSheetMethods } from "@/components/bottom-sheet";
import { ChatRoom, useConversations, useMessages } from "@/hooks/useChats";
import { getAvatarUrl, getDisplayName, getInitials } from "@/lib/utils";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useUpload } from "@/hooks/useUpload";

export interface SendSheetRef {
  open: (fileUri: string, isVideo: boolean, userId: string) => void;
}

const SendSheet = React.forwardRef<SendSheetRef>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  const { conversations } = useConversations();
  const { uploadMediaAndReturnSignedUrl } = useUpload();

  const [fileUri, setFileUri] = React.useState<string | null>(null);
  const [isVideo, setIsVideo] = React.useState(false);

  const [userId, setUserId] = React.useState<string | null>(null);

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  React.useImperativeHandle(ref, () => ({
    open: (uri: string, video: boolean, uid: string) => {
      setFileUri(uri);
      setUserId(uid);
      setIsVideo(video);
      bottomSheetRef.current?.open();
    },
  }));

  const handleSend = async (fileUriToSend: string, conversationId: string, sendMessageFn: (url: string, type: "string" | "url") => Promise<boolean>) => {
    const signedUrl = await uploadMediaAndReturnSignedUrl({
      isVideo,
      fileUri: fileUriToSend,
    });

    if (!signedUrl) {
      Alert.alert("Failed to send");
      return;
    }

    const message = await sendMessageFn(signedUrl, "url");

    if (!message) {
      Alert.alert("Failed to send message");
      return;
    }

    bottomSheetRef.current?.close();
    Alert.alert("Sent!");
  };

  const renderConversation = ({ item }: { item: ChatRoom }) => (
    <ConversationRow
      item={item}
      userId={userId || ""}
      isVideo={isVideo}
      fileUri={fileUri}
      theme={theme}
      onSend={handleSend}
    />
  );

  const ConversationRow = React.memo(
  ({ item, userId, isVideo, fileUri, theme, onSend }: {
    item: ChatRoom;
    userId: string;
    isVideo: boolean;
    fileUri: string | null;
    theme: typeof Colors.light;
    onSend: (fileUri: string, conversationId: string, sendMessageFn: (url: string, type: "string" | "url") => Promise<boolean>) => void;
  }) => {
    const displayName = getDisplayName(item, userId);
    const avatarUrl = getAvatarUrl(item, userId);
    const { sendMessage } = useMessages(item.id);

    const handleSend = () => {
      if (!fileUri) return;
      onSend(fileUri, item.id, sendMessage);
    };

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
          <View style={[styles.avatar, { backgroundColor: theme.supaPrimary }]}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
        )}

        <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
);

  return (
    <AppBottomSheet ref={bottomSheetRef} snapPoints={[250, 500]}>
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
    borderWidth: 1,
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
    backgroundColor: "#1181a0",
    padding: 10,
    borderRadius: 20,
  },
});
