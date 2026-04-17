// icon-button.tsx
import { SFSymbol, SymbolView } from "expo-symbols";
import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleProp, TouchableOpacity, ViewStyle } from "react-native";

const CONTAINER_WIDTH = 34;
const ICON_SIZE = 25;
const CONTAINER_PADDING = 5;

interface IconButtonProps {
  iosName: SFSymbol;
  androidName: ComponentProps<typeof Ionicons>["name"];
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  width?: number;
  height?: number;
}

export default function IconButton({
  androidName,
  iosName,
  containerStyle,
  height,
  width,
  onPress,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: "#00000050",
          padding: CONTAINER_PADDING,
          borderRadius: (CONTAINER_WIDTH + CONTAINER_PADDING * 2) / 2,
          width: CONTAINER_WIDTH,
          alignItems: "center",
          justifyContent: "center",
        },
        containerStyle,
      ]}
    >
      {Platform.OS === "ios" ? (
        <SymbolView
          name={iosName}
          type="hierarchical"
          size={ICON_SIZE}
          style={width && height ? { width, height } : {}}
        />
      ) : (
        <Ionicons
          name={androidName}
          size={ICON_SIZE}
          color="white"
        />
      )}
    </TouchableOpacity>
  );
}