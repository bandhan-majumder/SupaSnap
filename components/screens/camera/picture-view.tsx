import { FilterPreset } from "@/constants/filters";
import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { saveToLibraryAsync } from "expo-media-library";
import { shareAsync } from "expo-sharing";
import React, { useRef } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import IconButton from "../../common/icon-button";
import SendSheet, { SendSheetRef } from "./send-sheet";

interface PictureViewProps {
  picture: string;
  setPicture: React.Dispatch<React.SetStateAction<string>>;
  activeFilter: FilterPreset;
}

export default function PictureView({
  picture,
  setPicture,
  activeFilter,
}: PictureViewProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const sendSheetRef = useRef<SendSheetRef>(null);

  if (!user?.id) return null;

  const handleSendPress = () => {
    if (user?.id) {
      sendSheetRef.current?.open(picture, false, user.id, "image");
    }
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
            Alert.alert(t("camera.pictureSaved"));
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

      <View style={StyleSheet.absoluteFillObject}>
        <Image
          source={{ uri: picture }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        {activeFilter?.overlayOpacity > 0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: activeFilter.overlayColor,
                opacity: activeFilter.overlayOpacity,
              },
            ]}
          />
        )}
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={handleSendPress}>
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>

      <SendSheet ref={sendSheetRef} />
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
