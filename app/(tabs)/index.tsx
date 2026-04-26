import ButtonRowTools from "@/components/screens/camera/bottom-row-tools";
import CameraTools from "@/components/screens/camera/camera-tools";
import MainRowAction from "@/components/screens/camera/main-row-actionts";
import PictureView from "@/components/screens/camera/picture-view";
import QRCodeButton from "@/components/screens/camera/qr-code-button";
import VideoViewComponent from "@/components/screens/camera/video-view";
import { FILTER_PRESETS, FilterPreset } from "@/constants/filters";
import {
  BarcodeScanningResult,
  CameraMode,
  CameraView,
  FlashMode,
} from "expo-camera";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureDetector } from "react-native-gesture-handler";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);
  const [cameraMode, setCameraMode] = React.useState<CameraMode>("picture");
  const [qrCodeDetected, setQrCodeDetected] = React.useState<string>("");
  const [isBrowser, setIsBorwser] = React.useState<boolean>(false);
  const timeOutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraZoom, setCameraZoom] = React.useState<number>(0);
  const [enableTorch, setEnableTorch] = React.useState<boolean>(false);
  const [enableFlash, setEnableFlash] = React.useState<FlashMode>("off");
  const [cameraFacing, setCameraFacing] = React.useState<"front" | "back">("back");
  const [picture, setPicture] = React.useState<string>("");
  const [video, setVideo] = React.useState<string>("");
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = React.useState<FilterPreset>(FILTER_PRESETS[0]);

  const pinchGesture = usePinchZoom(cameraZoom, setCameraZoom);

  async function handleTakePicture() {
    const response = await cameraRef.current?.takePictureAsync({});
    setPicture(response!.uri);
  }

  const toggleRecord = React.useCallback(async () => {
    if (isRecording) {
      cameraRef.current?.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const response = await cameraRef.current?.recordAsync({});
      setVideo(response!.uri);
    }
  }, [isRecording]);

  // Reset recording state when switching modes
  function handleSetCameraMode(mode: CameraMode) {
    setIsRecording(false);
    setCameraMode(mode);
  }

  function handleBarCodeScanned(scanningResult: BarcodeScanningResult) {
    if (scanningResult.data) {
      setQrCodeDetected(scanningResult.data);
    }
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }
    timeOutRef.current = setTimeout(() => {
      setQrCodeDetected("");
    }, 500);
  }

  async function handleOpenQrCode() {
    setIsBorwser(true);
    const browserResult = await WebBrowser.openBrowserAsync(qrCodeDetected, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
    });
    if (browserResult.type === "cancel") {
      setIsBorwser(false);
    }
  }

  if (isBrowser) return <></>;
  if (picture) return <PictureView picture={picture} setPicture={setPicture} activeFilter={selectedFilter} />;
  if (video) return <VideoViewComponent video={video} setVideo={setVideo} />;

  return (
    <GestureDetector gesture={pinchGesture}>
      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          mode={cameraMode}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          zoom={cameraZoom}
          flash={enableFlash}
          enableTorch={enableTorch}
          facing={cameraFacing}
          onBarcodeScanned={handleBarCodeScanned}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              {qrCodeDetected ? (
                <QRCodeButton handleOpenQRCode={handleOpenQrCode} />
              ) : null}
              <CameraTools
                cameraFacing={cameraFacing}
                enableFlash={enableFlash}
                enableTorch={enableTorch}
                setEnableTorch={setEnableTorch}
                setEnableFlash={setEnableFlash}
                setCameraFacing={setCameraFacing}
              />
              <MainRowAction
                cameraMode={cameraMode}
                handleTakePicture={cameraMode === "picture" ? handleTakePicture : toggleRecord}
                isRecording={isRecording}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
              />
              <ButtonRowTools
                setCameraMode={handleSetCameraMode}
                cameraMode={cameraMode}
              />
            </View>
          </SafeAreaView>
          {selectedFilter.overlayOpacity > 0 && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: selectedFilter.overlayColor,
                  opacity: selectedFilter.overlayOpacity,
                },
              ]}
            />
          )}
        </CameraView>
      </View>
    </GestureDetector>
  );
}