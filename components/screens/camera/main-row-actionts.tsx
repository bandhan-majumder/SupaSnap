import { Colors } from "@/constants/theme";
import { CameraMode } from "expo-camera";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Asset, getAssetsAsync } from "expo-media-library";
import FilterThumbnail from "@/components/filter-thumbnail";
import { FILTER_PRESETS, FilterPreset } from "@/constants/filters";
import React from "react";

interface MainRowActionProps {
  handleTakePicture: () => void;
  cameraMode: CameraMode;
  isRecording: boolean;
  selectedFilter: FilterPreset;
  onSelectFilter: (f: FilterPreset) => void;
}

export default function MainRowAction({
  cameraMode,
  handleTakePicture,
  isRecording,
  selectedFilter,
  onSelectFilter,
}: MainRowActionProps) {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAlbums();
  }, []);

  // Reset visual recording state immediately when mode changes
  const [localRecording, setLocalRecording] = useState(false);

  useEffect(() => {
    setLocalRecording(isRecording);
  }, [isRecording]);

  useEffect(() => {
    setLocalRecording(false);
  }, [cameraMode]);

  async function getAlbums() {
    const albumAsset = await getAssetsAsync({
      mediaType: "photo",
      sortBy: "creationTime",
      first: 4,
    });
    setAssets(albumAsset.assets);
  }

  const androidIconName: React.ComponentProps<typeof Ionicons>["name"] =
    cameraMode === "picture"
      ? "radio-button-off"
      : localRecording
      ? "radio-button-on"
      : "ellipse-outline";

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        <FlatList
          inverted
          data={assets}
          renderItem={({ item }) => (
            <Image
              key={item.id}
              source={{ uri: item.uri }}
              style={styles.galleryImage}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryContent}
        />
      </View>
      <View style={styles.shutterWrapper}>
        <TouchableOpacity onPress={handleTakePicture}>
          <SymbolView
            name={
              cameraMode === "picture"
                ? "circle"
                : localRecording
                ? "record.circle"
                : "circle.circle"
            }
            size={90}
            type="hierarchical"
            tintColor={localRecording ? Colors.light.supaPrimary : "white"}
            animationSpec={{
              effect: {
                type: localRecording ? "pulse" : "bounce",
              },
              repeating: localRecording,
            }}
            fallback={
              <Ionicons
                name={androidIconName}
                size={90}
                color={localRecording ? Colors.light.supaPrimary : "white"}
              />
            }
          />
        </TouchableOpacity>
      </View>
      <View style={styles.side}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.filtersContent}
          showsHorizontalScrollIndicator={false}
        >
          {FILTER_PRESETS.map((filter) => (
            <FilterThumbnail
              key={filter.id}
              filter={filter}
              isSelected={selectedFilter.id === filter.id}
              onSelect={onSelectFilter}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 45,
  },
  side: {
    flex: 1,
    alignSelf: "center",
  },
  shutterWrapper: {
    width: 90,
    alignItems: "center",
    alignSelf: "center",
  },
  galleryImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  galleryContent: {
    gap: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  filtersContent: {
    gap: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
});