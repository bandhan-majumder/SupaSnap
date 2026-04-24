import { Colors } from "@/constants/theme";
import { useProfile } from "@/hooks/use-profile";
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

interface UsernameSetupProps {
  onComplete: () => void;
  isDark: boolean;
}

export default function UsernameSetup({
  onComplete,
  isDark,
}: UsernameSetupProps) {
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Pick a username
            </Text>
            <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
              This is how others will find you. You can change it later.
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputPrefix, { color: theme.tabIconDefault }]}>
              @
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: inputError
                    ? "#FF4D4D"
                    : username.length > 0
                      ? theme.tint
                      : theme.tabIconDefault,
                  backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                },
              ]}
              placeholder="your_username"
              placeholderTextColor={theme.tabIconDefault}
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
          </View>

          {inputError ? (
            <Text style={styles.errorText}>{inputError}</Text>
          ) : (
            <Text style={[styles.helperText, { color: theme.tabIconDefault }]}>
              Letters, numbers, and underscores only.
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.tint },
              (saving || username.trim().length === 0) && styles.buttonDisabled,
            ]}
            onPress={handleSaveUsername}
            disabled={saving || username.trim().length === 0}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
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
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 13,
    color: "#FF4D4D",
    marginBottom: 8,
    marginLeft: 2,
  },
  helperText: {
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 2,
  },
  button: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
});
