import { StyleSheet, ImageBackground, View } from "react-native";
import AuthComponent from "@/components/auth/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
        imageStyle={styles.image}
      />

      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        <AuthComponent />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#47484a",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    opacity: 0.99, 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(29, 29, 28, 0.82)",
  },
  container: {
    flex: 1,
  },
});
