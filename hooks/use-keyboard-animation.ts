// hooks/use-gradual-animation.ts
import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";

const OFFSET = 20;

export const useCustomKeyboardAnimation = () => {
  const height = useSharedValue(OFFSET);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        height.value = e.height > 0 ? e.height + OFFSET : OFFSET;
      },
      onEnd: (e) => {
        "worklet";
        height.value = e.height > 0 ? e.height + OFFSET : OFFSET;
      },
    },
    [],
  );

  return { height };
};