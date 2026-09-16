import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, fonts } from "../lib/theme";
import { loadOnboarding, type OnboardingData } from "../lib/storage";
import { forecastHoursOverDays, ILLUSTRATIVE_DAILY_MINUTES } from "../lib/forecast";
import Sprout from "../components/Sprout";

type Props = NativeStackScreenProps<RootStackParamList, "ForecastReveal">;

export default function ForecastRevealScreen({ navigation }: Props) {
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);

  useEffect(() => {
    loadOnboarding().then(setOnboarding);
  }, []);

  const hours = forecastHoursOverDays(ILLUSTRATIVE_DAILY_MINUTES, 30);

  return (
    <View style={styles.screen}>
      <Sprout size={64} mood="excited" />
      <Text style={styles.eyebrow}>HERE'S THE MATH</Text>
      <Text style={styles.headline}>
        {ILLUSTRATIVE_DAILY_MINUTES} minutes a day is{" "}
        <Text style={styles.highlight}>{hours} hours</Text> in a month.
      </Text>
      <Text style={styles.body}>
        That's roughly what most people lose to a single app, most days — without noticing. Put
        that same {ILLUSTRATIVE_DAILY_MINUTES} minutes toward{" "}
        <Text style={styles.goalInline}>{onboarding?.goal ?? "your goal"}</Text> instead, and in 30
        days you'd have {hours} real hours of progress on it.
      </Text>
      <Text style={styles.body}>
        That's the whole idea: pick which apps pull you away, and earn your way back in by
        spending a little time on what you actually want first.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("TrustExplainer")}>
        <Text style={styles.buttonText}>Show me how</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 80,
    gap: 14,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  headline: {
    color: colors.textPrimary,
    fontFamily: fonts.headingExtraBold,
    fontSize: 28,
    lineHeight: 36,
  },
  highlight: {
    color: colors.primary,
  },
  body: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  goalInline: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
  },
  button: {
    marginTop: "auto",
    marginBottom: 40,
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
