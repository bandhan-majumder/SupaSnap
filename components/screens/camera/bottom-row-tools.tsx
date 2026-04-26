import { CameraMode } from "expo-camera";
import { Link } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import IconButton from "../../common/icon-button";
import { ThemedText } from "../../themed-text";

interface BottomRowToolsProp {
  setCameraMode: (mode: CameraMode) => void, // React.Dispatch<React.SetStateAction<CameraMode>>;
  cameraMode: CameraMode;
}

export default function ButtonRowTools({
  setCameraMode,
  cameraMode,
}: BottomRowToolsProp) {
  return (
    <View style={[styles.bottomContainer, styles.directionRowItemsCenter]}>
      <Link asChild href={"/media-library"}>
        <IconButton androidName="library" iosName="photo.stack" />
      </Link>
      <View style={styles.directionRowItemsCenter}>
        <TouchableOpacity>
          <ThemedText
            onPress={() => setCameraMode("picture")}
            style={{
              fontWeight: cameraMode === "picture" ? "bold" : "100",
            }}
          >
            snap
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCameraMode("video")}>
          <ThemedText
            style={{
              fontWeight: cameraMode === "video" ? "bold" : "100",
            }}
          >
            record
          </ThemedText>
        </TouchableOpacity>
      </View>
      <IconButton androidName="add" iosName="magnifyingglass" />
    </View>
  );
}

const styles = StyleSheet.create({
  directionRowItemsCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bottomContainer: {
    width: "100%",
    justifyContent: "space-between",
    position: "absolute",
    alignSelf: "center",
    bottom: 6,
    padding: 12,
  },
});
