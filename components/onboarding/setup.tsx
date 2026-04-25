import { Colors } from "@/constants/theme";
import { useProfile } from "@/hooks/use-profile";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

interface UsernameSetupProps {
  onComplete: () => void;
  isDark: boolean;
}

export default function UsernameSetup({ onComplete, isDark }: UsernameSetupProps) {
  const { t } = useTranslation();
  const theme = isDark ? Colors.dark : Colors.light;
  const { updateProfile } = useProfile();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSaveUsername = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setInputError("Username can't be empty.");
      return;
    }
    if (trimmed.length < 3) {
      setInputError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setInputError("Only letters, numbers, and underscores allowed.");
      return;
    }
    setInputError(null);
    setSaving(true);
    const result = await updateProfile({ username: trimmed });
    setSaving(false);
    if (result.success) {
      onComplete();
    } else {
      setInputError(result.error || "Something went wrong. Try again.");
    }
  };

  const isReady = username.trim().length >= 3;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inner}>
          <View style={styles.top}>
            <Text style={[styles.heading, { color: theme.text }]}>
              {t("onboarding.pickUsername")}
            </Text>
            <Text style={[styles.subheading, { color: isDark ? "#555" : "#bbb" }]}>
              {t("onboarding.usernameHelper")}
            </Text>
          </View>

          <View style={[
            styles.inputRow,
            {
              backgroundColor: isDark ? "#1a1a1a" : "#eef0f5",
              borderColor: inputError
                ? "#f87171"
                : isReady
                ? theme.tint
                : "transparent",
            },
          ]}>
            <Text style={[styles.prefix, { color: isDark ? "#444" : "#bbb" }]}>@</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t("onboarding.yourUsername")}
              placeholderTextColor={isDark ? "#3a3a3a" : "#c0c0c0"}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (inputError) setInputError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={handleSaveUsername}
            />
            {isReady && !inputError && (
              <Ionicons name="checkmark-circle" size={18} color={theme.tint} />
            )}
          </View>

          {inputError ? (
            <Text style={styles.errorText}>{inputError}</Text>
          ) : (
            <Text style={[styles.helperText, { color: isDark ? "#3a3a3a" : "#c8c8c8" }]}>
              {t("onboarding.lettersNumbersUnderscores")}
            </Text>
          )}
        </View>

        <View style={[styles.footer, { borderTopColor: isDark ? "#1a1a1a" : "#f0f0f0" }]}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isReady ? '#D8B38A' : isDark ? "#1a1a1a" : "#eef0f5" },
              (saving || !isReady) && { opacity: 0.5 },
            ]}
            onPress={handleSaveUsername}
            disabled={saving || !isReady}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={[styles.buttonText, { color: isReady ? "#000" : isDark ? "#333" : "#bbb" }]}>
                {t("onboarding.continue")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 16,
  },
  top: {
    gap: 6,
    marginBottom: 8,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  prefix: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: "#f87171",
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  button: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  header: { marginBottom: 36 },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: 6,
  },
  buttonDisabled: { opacity: 0.5 },
});
