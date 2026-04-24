import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { saveToLibraryAsync } from "expo-media-library";
import { shareAsync } from "expo-sharing";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import IconButton from "./icon-button";
import SendSheet, { SendSheetRef } from "./send-sheet";

interface VideoViewComponentProps {
  video: string;
  setVideo: React.Dispatch<React.SetStateAction<string>>;
}
export default function VideoViewComponent({
  video,
  setVideo,
}: VideoViewComponentProps) {
  const { user } = useAuth();
  const videViewRef = React.useRef<VideoView>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const sendSheetRef = useRef<SendSheetRef>(null);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);

  const handleSendPress = () => {
    if (user?.id) {
      sendSheetRef.current?.open(video, true, user.id, "video");
    }
  };

  const player = useVideoPlayer(video, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    const subscription = player.addListener("playingChange", (isPlaying) => {
      setIsPlaying(isPlaying.isPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);
  return (
    <View>
      <View
        style={{
          position: "absolute",
          right: 6,
          zIndex: 1,
          paddingTop: 50,
          gap: 16,
        }}
      >
        <IconButton
          iosName="cloud.sleet"
          androidName="close"
          onPress={() => setVideo("")}
        />
        <IconButton
          iosName="arrow.down"
          androidName="arrow-down"
          onPress={async () => {
            await saveToLibraryAsync(video);
            Alert.alert("Video saved!");
          }}
        />
        <IconButton
          iosName={isPlaying ? "play" : "pause"}
          androidName={isPlaying ? "play" : "pause"}
          onPress={() => {
            if (isPlaying) player.pause();
            else player.play();
            setIsPlaying(isPlaying);
          }}
        />
        <IconButton
          iosName="shared.with.you.circle"
          androidName="share"
          onPress={async () =>
            await shareAsync(video, {
              dialogTitle: "Share snap with someone!",
            })
          }
        />
      </View>
      <VideoView
        ref={videViewRef}
        allowsFullscreen
        nativeControls={false}
        player={player}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSendPress}>
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>

      <SendSheet ref={sendSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
