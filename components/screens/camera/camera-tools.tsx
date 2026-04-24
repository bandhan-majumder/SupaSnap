import { FlashMode } from "expo-camera";
import { Dispatch, SetStateAction } from "react";
import { View } from "react-native";
import IconButton from "../../common/icon-button";

interface CameraToolsProps {
  cameraZoom: number;
  cameraFacing: "front" | "back";
  enableTorch: boolean;
  enableFlash: FlashMode;
  setCameraFacing: Dispatch<SetStateAction<"front" | "back">>;
  setEnableTorch: Dispatch<SetStateAction<boolean>>;
  setEnableFlash: Dispatch<SetStateAction<FlashMode>>;
  setCameraZoom: Dispatch<SetStateAction<number>>;
}

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0;
const ZOOM_MAX = 1;
const ACTIVE_STYLE = { backgroundColor: "#FFC107" };

export default function CameraTools({
  setCameraFacing,
  setCameraZoom,
  setEnableFlash,
  setEnableTorch,
  cameraFacing,
  cameraZoom,
  enableFlash,
  enableTorch,
}: CameraToolsProps) {
  return (
    <View style={{ position: "absolute", right: 6, gap: 16, zIndex: 1 }}>
      <IconButton
        iosName={enableTorch ? "flashlight.on.circle" : "flashlight.off.circle"}
        androidName={enableTorch ? "flashlight" : "flashlight-outline"}
        containerStyle={enableTorch ? ACTIVE_STYLE : {}}
        onPress={() => setEnableTorch((p) => !p)}
      />

      <IconButton
        iosName={enableFlash === "off" ? "bolt.slash.circle" : "bolt.circle"}
        androidName={enableFlash === "off" ? "flash-off" : "flash"}
        containerStyle={enableFlash !== "off" ? ACTIVE_STYLE : {}}
        onPress={() => setEnableFlash((p) => (p === "off" ? "on" : "off"))}
      />

      <IconButton
        iosName="arrow.triangle.2.circlepath.camera"
        androidName="camera-reverse-outline"
        onPress={() =>
          setCameraFacing((p) => (p === "back" ? "front" : "back"))
        }
      />

      <IconButton
        iosName="plus.magnifyingglass"
        androidName="add-circle-outline"
        onPress={() => {
          if (cameraZoom < ZOOM_MAX) {
            setCameraZoom((p) => p + ZOOM_STEP);
          }
        }}
      />

      <IconButton
        iosName="minus.magnifyingglass"
        androidName="remove-circle-outline"
        onPress={() => {
          if (cameraZoom > ZOOM_MIN) {
            setCameraZoom((p) => p - ZOOM_STEP);
          }
        }}
      />
    </View>
  );
}
