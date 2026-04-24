import React, { useEffect, useRef, useCallback } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView, VideoPlayer } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MediaViewerProps {
  visible: boolean;
  uri: string;
  mediaType: "image" | "video";
  onClose: () => void;
}

interface VideoViewerProps {
  uri: string;
  onPlayerReady: (player: VideoPlayer) => void;
}

const VideoViewer = ({ uri, onPlayerReady }: VideoViewerProps) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
    p.play();
  });

  useEffect(() => {
    onPlayerReady(player);
  }, [player]);

  return (
    <VideoView
      player={player}
      style={styles.fullscreenMedia}
      allowsFullscreen
      nativeControls
    />
  );
};

export default function MediaViewer({
  visible,
  uri,
  mediaType,
  onClose,
}: MediaViewerProps) {
  const insets = useSafeAreaInsets();
  const playerRef = useRef<VideoPlayer | null>(null);

  const handlePlayerReady = useCallback((player: VideoPlayer) => {
    playerRef.current = player;
  }, []);

  const handleClose = useCallback(() => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    } catch (_) {
    }
    playerRef.current = null;
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + 12 }]}
          onPress={handleClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        {mediaType === "image" ? (
          <Image
            source={{ uri }}
            style={styles.fullscreenMedia}
            contentFit="contain"
          />
        ) : (
          <VideoViewer uri={uri} onPlayerReady={handlePlayerReady} />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  closeButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  fullscreenMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});