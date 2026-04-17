import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  BarcodeScanningResult,
  Camera,
  CameraMode,
  CameraView,
  FlashMode,
} from "expo-camera";
import React, { useEffect } from "react";
import IconButton from "@/components/icon-button";
import ButtonRowTools from "@/components/bottom-row-tools";
import MainRowAction from "@/components/main-row-actionts";
import QRCodeButton from "@/components/qr-code-button";
import CameraTools from "@/components/camera-tools";
import { SafeAreaView } from "react-native-safe-area-context";
import PictureView from "@/components/picture-view";
import VideoViewComponent from "@/components/video-view";

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);
  const [cameraMode, setCameraMode] = React.useState<CameraMode>("picture");
  const [qrCodeDetected, setQrCodeDetected] = React.useState<string>("");
  const [isBrowser, setIsBorwser] = React.useState<boolean>(false);
  const timeOutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraZoom, setCameraZoom] = React.useState<number>(0);
  const [enableTorch, setEnableTorch] = React.useState<boolean>(false);
  const [enableFlash, setEnableFlash] = React.useState<FlashMode>("off");
  const [cameraFacing, setCameraFacing] = React.useState<"front" | "back">(
    "back",
  );
  const [picture, setPicture] = React.useState<string>("");
  const [video, setVideo] = React.useState<string>("");
  const [isRecording, setIsRecording] = React.useState<boolean>(false);

  async function handleTakePicture(){
    const response = await cameraRef.current?.takePictureAsync({
      // quality: 1,
    })
    setPicture(response!.uri);
  }

  async function toggleRecord(){
   if (isRecording){
    cameraRef.current?.stopRecording();
    setIsRecording(false);
   }else {
    setIsRecording(true);
    const response = await cameraRef.current?.recordAsync({
      // maxDuration: 10000
    });
    setVideo(response!.uri)
   }
  }

  function handleBarCodeScanned(scanningResult: BarcodeScanningResult) {
    if (scanningResult.data) {
      console.log("scanning result data: ", scanningResult.data);
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
  if (picture) return <PictureView picture={picture} setPicture={setPicture}/>
  if (video) return <VideoViewComponent video={video} setVideo={setVideo}/>

  return (
    // HomeScreen
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        mode={cameraMode}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        zoom={cameraZoom}
        flash={enableFlash}
        enableTorch={enableTorch}
        facing={cameraFacing}
        onBarcodeScanned={handleBarCodeScanned}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{flex: 1}}>
            {qrCodeDetected ? (
              <QRCodeButton handleOpenQRCode={handleOpenQrCode} />
            ) : null}
            <CameraTools
              cameraFacing={cameraFacing}
              cameraZoom={cameraZoom}
              enableFlash={enableFlash}
              enableTorch={enableTorch}
              setEnableTorch={setEnableTorch}
              setEnableFlash={setEnableFlash}
              setCameraFacing={setCameraFacing}
              setCameraZoom={setCameraZoom}
            />
            <MainRowAction
              cameraMode={cameraMode}
              handleTakePicture={cameraMode === "picture" ? handleTakePicture : toggleRecord}
              isRecording={isRecording}
            />
            <ButtonRowTools
              setCameraMode={setCameraMode}
              cameraMode={cameraMode}
            />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
