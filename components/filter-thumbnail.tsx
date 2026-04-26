import { FilterPreset } from "@/constants/filters";
import {
  Canvas,
  ColorMatrix,
  Image as SkiaImage,
  useImage,
} from "@shopify/react-native-skia";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GRAYSCALE_MATRIX = [
  0.299, 0.587, 0.114, 0, 0,
  0.299, 0.587, 0.114, 0, 0,
  0.299, 0.587, 0.114, 0, 0,
  0,     0,     0,     1, 0,
];

interface Props {
  filter: FilterPreset;
  isSelected: boolean;
  onSelect: (filter: FilterPreset) => void;
}

function GrayscaleThumbnail() {
  const image = useImage(require("@/assets/images/filter-preview.jpeg"));
  if (!image) return null;
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <SkiaImage image={image} x={0} y={0} width={50} height={50} fit="cover">
        <ColorMatrix matrix={GRAYSCALE_MATRIX} />
      </SkiaImage>
    </Canvas>
  );
}

export default function FilterThumbnail({
  filter,
  isSelected,
  onSelect,
}: Props) {
  return (
    <TouchableOpacity onPress={() => onSelect(filter)} style={styles.container}>
      <View style={[styles.preview, isSelected && styles.selectedRing]}>
        {filter.isGrayscale ? (
          <GrayscaleThumbnail />
        ) : (
          <>
            <Image
              source={require("@/assets/images/filter-preview.jpeg")}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            {filter.overlayOpacity > 0 && (
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: filter.overlayColor,
                    opacity: filter.overlayOpacity,
                  },
                ]}
              />
            )}
          </>
        )}
      </View>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 4 },
  preview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedRing: { borderColor: "white" },
  label: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
  labelSelected: { color: "white", fontWeight: "600" },
});