import { FlashMode } from "expo-camera";
import { Dispatch, SetStateAction } from "react";
import { View } from "react-native";
import IconButton from "../../common/icon-button";

interface CameraToolsProps {
  cameraFacing: "front" | "back";
  enableTorch: boolean;
  enableFlash: FlashMode;
  setCameraFacing: Dispatch<SetStateAction<"front" | "back">>;
  setEnableTorch: Dispatch<SetStateAction<boolean>>;
  setEnableFlash: Dispatch<SetStateAction<FlashMode>>;
}

const ACTIVE_STYLE = { backgroundColor: "#FFC107" };

export default function CameraTools({
  setCameraFacing,
  setEnableFlash,
  setEnableTorch,
  cameraFacing,
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
    </View>
  );
}