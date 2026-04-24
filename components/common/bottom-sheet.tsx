import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet, useColorScheme, View } from "react-native";

export interface BottomSheetMethods {
  open: () => void;
  close: () => void;
}

interface Props {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
}

const AppBottomSheet = forwardRef<BottomSheetMethods, Props>(
  ({ children, snapPoints = ["80%"] }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);
    const theme = useColorScheme();

    const isDark = theme === "dark";

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
    }));

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#8e8e93" : "#c7c7cc",
          width: 40,
        }}
      >
        <BottomSheetView style={styles.container}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dragHandleContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});

AppBottomSheet.displayName = "AppBottomSheet";
export default AppBottomSheet;