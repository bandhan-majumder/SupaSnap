import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

export default function Auth() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    if (user) {
      Keyboard.dismiss();
      router.replace("/onboarding");
    }
  }, [user]);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert(t("auth.error"), t("auth.pleaseFillInAllFields"));
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) Alert.alert(t("auth.loginError"), error.message);
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          Alert.alert(t("auth.signUpError"), error.message);
        } else {
          Alert.alert(t("auth.success"), t("auth.signupSuccessful"));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            {isLogin ? t("auth.welcomeBack") : t("auth.createAnAccount")}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.label }]}>{t("auth.email")}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? "#fff" : "#111",
                  borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
                },
              ]}
              placeholder={t("auth.enterYourEmail")}
              placeholderTextColor={isDark ? "#555" : "#aaa"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              keyboardAppearance={isDark ? "dark" : "light"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.label }]}>{t("auth.password")}</Text>
            <View style={[
              styles.passwordWrapper,
              { borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }
            ]}>
              <TextInput
                style={[styles.passwordInput, { color: isDark ? "#fff" : "#111" }]}
                placeholder={t("auth.enterYourPassword")}
                placeholderTextColor={isDark ? "#555" : "#aaa"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                keyboardAppearance={isDark ? "dark" : "light"}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                style={styles.eyeButton}
              >
                <Text style={[styles.eyeText, { color: isDark ? "#666" : "#aaa" }]}>
                  {showPassword ? <Ionicons name="eye" /> : <Ionicons name="eye-off" />}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#F6C15A' }]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? t("auth.signIn") : t("auth.signUp")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
            activeOpacity={0.7}
          >
            <Text style={[styles.switchText, { color: theme.text }]}>
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
              <Text style={styles.switchBold}>
                {isLogin ? t("auth.signUp") : t("auth.signIn")}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
  },
  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 10,
  },
  eyeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  switchButton: {
    alignItems: "center",
    paddingVertical: 6,
  },
  switchText: {
    fontSize: 14,
  },
  switchBold: {
    fontWeight: "bold",
  },
});