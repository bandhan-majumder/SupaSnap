import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function AnimatedLoadingScreen() {
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);

  useEffect(() => {
    const bounceSequence = withSequence(
      withTiming(-35, { duration: 350, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 350, easing: Easing.in(Easing.quad) }),
      withTiming(0, { duration: 800 }),
    );

    translateY1.value = withRepeat(bounceSequence, -1, false);
    translateY2.value = withDelay(150, withRepeat(bounceSequence, -1, false));
    translateY3.value = withDelay(300, withRepeat(bounceSequence, -1, false));
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY3.value }],
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.content}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingShapes}>
            <Animated.View
              style={[styles.shape, styles.bubble, animatedStyle1]}
            >
              <View style={styles.bubbleTail} />
            </Animated.View>
            <Animated.View
              style={[styles.shape, styles.diamond, animatedStyle2]}
            />
            <Animated.View
              style={[styles.shape, styles.squircle, animatedStyle3]}
            />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E18",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingShapes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  shape: {
    width: 40,
    height: 40,
  },
  bubble: {
    backgroundColor: "#F0A830",
    borderRadius: 12,
    borderBottomLeftRadius: 2,
  },
  bubbleTail: {
    position: "absolute",
    bottom: -7,
    left: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderTopColor: "#F0A830",
    borderRightColor: "transparent",
  },
  diamond: {
    width: 28,
    height: 28,
    backgroundColor: "#F5EDD6",
    borderRadius: 5,
    transform: [{ rotate: "45deg" }],
  },
  squircle: {
    backgroundColor: "#C47F17",
    borderRadius: 14,
    borderTopRightRadius: 4,
  },
  loadingText: {
    fontSize: 14,
    color: "#F5EDD6",
    fontWeight: "500",
    letterSpacing: 1.5,
    opacity: 0.5,
  },
});
