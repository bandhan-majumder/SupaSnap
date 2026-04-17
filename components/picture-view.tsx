import { Image } from "expo-image";
import React from "react";
import { Alert, View } from "react-native";
import IconButton from "./icon-button";
import { saveToLibraryAsync } from "expo-media-library";
import { shareAsync } from "expo-sharing";

interface PictureViewProps {
  picture: string;
  setPicture: React.Dispatch<React.SetStateAction<string>>;
}
export default function PictureView({ picture, setPicture }: PictureViewProps) {
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
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </View>
  );
}
