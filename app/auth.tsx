import {
  ImageBackground,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Image,
} from "react-native";
import AuthComponent from "@/components/auth/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

export default function AuthScreen() {
  const [showAuth, setShowAuth] = useState(false);
  const {t} = useTranslation();

  const splashOpacity = useRef(new Animated.Value(1)).current;
  const authOpacity = useRef(new Animated.Value(0)).current;
  const authTranslateY = useRef(new Animated.Value(30)).current;

  const handleContinue = () => {
    setShowAuth(true);

    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(authOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(authTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.root}>
      {showAuth && (
        <Animated.View
          style={[
            styles.absolute,
            {
              opacity: authOpacity,
              transform: [{ translateY: authTranslateY }],
            },
          ]}
        >
          <View style={[styles.absolute, styles.authOverlay]} />
          <SafeAreaView style={styles.authSafeArea}>
            <AuthComponent />
          </SafeAreaView>
        </Animated.View>
      )}

      {!showAuth && (
        <Animated.View style={[styles.absolute, { opacity: splashOpacity }]}>
          <ImageBackground
            source={require("@/assets/images/background.png")}
            style={styles.flex}
            resizeMode="cover"
          >
            <View style={[styles.absolute, styles.splashOverlay]} />
            <SafeAreaView style={styles.flex}>
              <View style={styles.splashInner}>
                <View className="flex items-center mt-5">
                  <Image source={require("@/assets/images/logo.png")} className="w-70 h-25" />
                </View>

                <View style={styles.splashBottom}>
                  <View style={styles.splashTextGroup}>
                    <Text style={styles.splashTitle}>
                      {t("auth.yourJourneyStartsHere")}
                    </Text>
                    <Text style={styles.splashSubtitle}>
                      {t("auth.signInOrCreate")}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleContinue}
                    activeOpacity={0.85}
                    style={styles.ctaButton}
                  >
                    <Text style={styles.ctaText}>{t("auth.getStarted")}</Text>
                  </TouchableOpacity>

                  <Text style={styles.splashFooter}>
                    {t("auth.byContinuing")}{" "}
                    <Link href="/(others)/terms" style={styles.linkText}>
                      {t("auth.termsPrivacy")}
                    </Link>
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1d1d1c",
  },
  flex: {
    flex: 1,
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  linkText: {
    textDecorationLine: "underline",
  },
  authOverlay: {
    backgroundColor: "rgba(29, 29, 28, 0.90)",
  },
  authSafeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  splashOverlay: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  splashInner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 48,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 2,
  },
  splashBottom: {
    gap: 20,
  },
  splashTextGroup: {
    gap: 8,
  },
  splashTitle: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "bold",
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: "#F6C15A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    color: "#1d1d1c",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  splashFooter: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    textAlign: "center",
  },
});
