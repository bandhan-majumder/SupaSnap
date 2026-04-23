import React, { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
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
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

export interface SendSheetRef {
  open: () => void;
}

const SendSheet = React.forwardRef<SendSheetRef>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const { conversations } = useConversations();
  const { user } = useAuth();

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  React.useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.open(),
  }));

  const renderConversation = ({ item }: { item: ChatRoom }) => {
    const displayName = getDisplayName(item, user?.id || "");
    const avatarUrl = getAvatarUrl(item, user?.id || "");

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
          onPress={() => {}}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

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