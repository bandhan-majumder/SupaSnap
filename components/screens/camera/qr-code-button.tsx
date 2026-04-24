import { TouchableOpacity } from "react-native";
import IconButton from "../../common/icon-button";
import { ThemedText } from "../../themed-text";

interface QRCodeButtonProps {
  handleOpenQRCode: () => void;
}

export default function QRCodeButton({ handleOpenQRCode }: QRCodeButtonProps) {
  return (
    <TouchableOpacity
      onPress={handleOpenQRCode}
      style={{
        width: 200,
        alignItems: "center",
        top: "65%",
        alignSelf: "center",
        padding: 6,
        borderWidth: 3,
        borderRadius: 10,
        borderStyle: "dashed",
        borderColor: "white",
      }}
    >
      <IconButton iosName="qrcode" androidName="qr-code" />
      <ThemedText type="defaultSemiBold" style={{ color: "white" }}>
        QR Code Detected
      </ThemedText>
    </TouchableOpacity>
  );
}
