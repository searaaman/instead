import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, fonts } from "../lib/theme";
import { SproutTip } from "../components/Sprout";

type Props = NativeStackScreenProps<RootStackParamList, "TrustExplainer">;

export default function TrustExplainerScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>BEFORE WE ASK FOR ANYTHING</Text>
      <Text style={styles.title}>Here's exactly what this app needs, and why.</Text>

      <SproutTip
        mood="calm"
        text="Nothing sneaky, promise — here's exactly what each permission does before you tap anything."
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👀 See how long you use certain apps</Text>
        <Text style={styles.cardBody}>
          So the dashboard can show your real numbers, not guesses. Android calls this "Usage
          access" — it only reports time spent per app, not what you did in them.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 Notice when you open a locked app</Text>
        <Text style={styles.cardBody}>
          This is what actually redirects you here instead of letting the app open. Android calls
          it "Accessibility" — the same feature real screen-time apps use. Your phone will show a
          serious-looking warning about it; that's normal, not a sign something's wrong.
        </Text>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Nothing leaves your phone.</Text>
        <Text style={styles.noticeBody}>
          There's no account, no server, no analytics. Everything — your goal, your apps, your
          progress — stays stored locally on this device.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SelectApps")}>
        <Text style={styles.buttonText}>Makes sense, continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    gap: 14,
  },
  eyebrow: {
    color: colors.info,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.headingBold,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
  },
  cardBody: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  noticeCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  noticeTitle: {
    color: colors.primaryStrong,
    fontFamily: fonts.headingSemiBold,
    fontSize: 15,
  },
  noticeBody: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
});
