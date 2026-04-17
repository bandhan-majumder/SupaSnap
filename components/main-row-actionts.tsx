import { Colors } from "@/constants/theme";
import { CameraMode } from "expo-camera";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Asset, getAlbumsAsync, getAssetsAsync } from "expo-media-library";

interface MainRowActionProps {
  handleTakePicture: () => void;
  cameraMode: CameraMode;
  isRecording: boolean;
}

export default function MainRowAction({
  cameraMode,
  handleTakePicture,
  isRecording,
}: MainRowActionProps) {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAlbums();
  }, [])

  async function getAlbums() {
    const fetchAlbumns = await getAlbumsAsync();
    const albumAsset = await getAssetsAsync({
     // album: fetchAlbumns[0],
      mediaType: "photo",
      sortBy: "creationTime",
      first: 4,
    });
    setAssets(albumAsset.assets);
  }

  const androidIconName: React.ComponentProps<typeof Ionicons>["name"] =
    cameraMode === "picture"
      ? "radio-button-off"
      : isRecording
        ? "radio-button-on"
        : "ellipse-outline";

  return (
    <View style={styles.container}>
      <FlatList
      inverted
        data={assets}
        renderItem={({ item }) => (
          <Image
            key={item.id}
            source={{uri: item.uri}}
            style={{
              width: 50,
              height: 50,
              borderRadius: 5,
            }}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{gap: 6}}
      />
      <TouchableOpacity onPress={handleTakePicture}>
        <SymbolView
          name={
            cameraMode === "picture"
              ? "circle"
              : isRecording
                ? "record.circle"
                : "circle.circle"
          }
          size={90}
          type="hierarchical"
          tintColor={isRecording ? Colors.light.supaPrimary : "white"}
          animationSpec={{
            effect: {
              type: isRecording ? "pulse" : "bounce",
            },
            repeating: isRecording,
          }}
          fallback={
            <Ionicons
              name={androidIconName}
              size={90}
              color={isRecording ? Colors.light.supaPrimary : "white"}
            />
          }
        />
      </TouchableOpacity>
      <ScrollView
        horizontal
        contentContainerStyle={{ gap: 2 }}
        showsHorizontalScrollIndicator={false}
      >
        {[0, 1, 2, 3].map((item) => (
          <SymbolView
            key={item}
            name="face.dashed"
            size={50}
            type="hierarchical"
            tintColor={"white"}
            fallback={
              <Ionicons
                color={"white"}
                size={50}
                key={item}
                name="person-circle-outline"
              />
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    height: 100,
    bottom: 45,
  },
});
