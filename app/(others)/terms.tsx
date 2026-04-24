import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Terms & Privacy</Text>

        <Section title="Use">
          Use the app responsibly. No misuse or illegal activity.
        </Section>

        <Section title="Account">
          You’re responsible for your account and its security.
        </Section>

        <Section title="Data">
          We collect basic info to improve your experience.
        </Section>

        <Section title="Privacy">
          Your data is not sold and is handled securely.
        </Section>

        <Section title="Updates">
          Terms may change. Continued use means acceptance.
        </Section>

        <Section title="Contact">
          support@supasnap.com
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  section: {
    marginBottom: 14,
  },
  heading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f5c542",
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    color: "#ccc",
    lineHeight: 18,
  },
});