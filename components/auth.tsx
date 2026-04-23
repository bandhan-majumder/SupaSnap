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
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function Auth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert("Login Error", error.message);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          Alert.alert("Sign Up Error", error.message);
        } else {
          Alert.alert("Success", "Signup successfull");
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#ECEDEE' }]}>SupaChat</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            {isLogin ? "Welcome back!" : "Create an account"}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.label }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: "#00000000",
                  color: '#000000',
                  borderColor: isDark ? "#333" : "#ddd",
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              keyboardAppearance={isDark ? "dark" : "light"}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.label }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: "#00000000",
                  color: '#000000',
                  borderColor: isDark ? "#333" : "#ddd",
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              keyboardAppearance={isDark ? "dark" : "light"}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.supaPrimary }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "Sign In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={[styles.switchText, { color: theme.tint }]}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <Text style={{ fontWeight: "bold" }}>
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? "#666" : "#999" }]}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
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
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  switchButton: {
    alignItems: "center",
    padding: 12,
  },
  switchText: {
    fontSize: 14,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});
