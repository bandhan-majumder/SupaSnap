import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  useColorScheme,
} from "react-native";
import IconButton from "./icon-button";
import { saveToLibraryAsync } from "expo-media-library";
import { shareAsync } from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import AppBottomSheet, {
  BottomSheetMethods,
} from "@/components/bottom-sheet";
import { ChatRoom, useConversations } from "@/hooks/useChats";
import {
  getAvatarUrl,
  getDisplayName,
  getInitials,
} from "@/lib/utils";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";

interface PictureViewProps {
  picture: string;
  setPicture: React.Dispatch<React.SetStateAction<string>>;
}

export default function PictureView({
  picture,
  setPicture,
}: PictureViewProps) {
   const { user } = useAuth();
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const { conversations } = useConversations();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No conversations yet</Text>
    </View>
  );

  const renderConversation = ({ item }: { item: ChatRoom }) => {
    const displayName = getDisplayName(item, user?.id || '');
    const avatarUrl = getAvatarUrl(item, user?.id || '');

    return (
      <View
        style={[
          styles.conversationRow,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.supaPrimary },
            ]}
          >
            <Text style={styles.avatarText}>
              {getInitials(displayName)}
            </Text>
          </View>
        )}

        <Text
          style={[styles.nameText, { color: theme.text }]}
          numberOfLines={1}
        >
          {displayName}
        </Text>

        <TouchableOpacity
          style={styles.rowSendButton}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topActions}>
        <IconButton
          iosName="cloud.sleet"
          androidName="close"
          onPress={() => setPicture("")}
        />
        <IconButton
          iosName="arrow.down"
          androidName="arrow-down"
          onPress={async () => {
            await saveToLibraryAsync(picture);
            Alert.alert("Picture saved!");
          }}
        />
        <IconButton
          iosName="shared.with.you.circle"
          androidName="share"
          onPress={async () =>
            await shareAsync(picture, {
              dialogTitle: "Share snap with someone!",
            })
          }
        />
      </View>

      <Image
        source={{ uri: picture }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => bottomSheetRef.current?.open()}
        activeOpacity={0.8}
      >
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>

      <AppBottomSheet ref={bottomSheetRef} snapPoints={[250, 500]}>
        <FlatList
        ListHeaderComponent={<View>
          <Text style={{
            fontSize: 17,
            color: Colors.dark.text,
          }}>Send your snap to friends</Text>
        </View>}
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  topActions: {
    position: "absolute",
    right: 10,
    top: 50,
    zIndex: 10,
    gap: 16,
  },

  listContent: {
    padding: 12,
    gap: 10,
    flexGrow: 1,
  },

  sendButton: {
    position: "absolute",
    bottom: 40,
    right: 20,

    backgroundColor: "#1181a0",
    padding: 14,
    borderRadius: 30,

    justifyContent: "center",
    alignItems: "center",

    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },

  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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

  nameText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
  },

  rowSendButton: {
    backgroundColor: "#1181a0",
    padding: 10,
    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",

    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  emptyText: {
    color: "#888",
    fontSize: 14,
  },
});