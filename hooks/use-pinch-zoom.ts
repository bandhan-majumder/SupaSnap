import { useRef } from "react";
import { Gesture } from "react-native-gesture-handler";

const ZOOM_MIN = 0;
const ZOOM_MAX = 1;
// Controls how sensitive the pinch is. Lower = slower zoom.
const ZOOM_SENSITIVITY = 0.5;

export function usePinchZoom(
  cameraZoom: number,
  setCameraZoom: (zoom: number) => void
) {
  // Snapshot of zoom when the pinch gesture starts
  const zoomAtGestureStart = useRef(cameraZoom);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      // Lock in the current zoom so delta is applied from here
      zoomAtGestureStart.current = cameraZoom;
    })
    .onUpdate((e) => {
      // e.scale: 1 = no change, >1 = zoom in, <1 = zoom out
      const delta = (e.scale - 1) * ZOOM_SENSITIVITY;
      const next = zoomAtGestureStart.current + delta;
      setCameraZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next)));
    })
    .runOnJS(true); // Required since setCameraZoom updates React state

  return pinchGesture;
}