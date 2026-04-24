import { StyleSheet, ImageBackground } from "react-native";
import AuthComponent from "@/components/auth/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  return (
    <ImageBackground
      source={require("@/assets/images/background.png")} 
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.container]}>
        <AuthComponent />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
