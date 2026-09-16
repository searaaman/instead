import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { saveOnboarding } from "../lib/storage";
import { colors, fonts } from "../lib/theme";
import { SproutTip } from "../components/Sprout";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);

  const canContinue = name.trim().length > 0 && goal.trim().length > 2;

  async function handleContinue() {
    if (!canContinue) return;
    setSaving(true);
    await saveOnboarding({
      name: name.trim(),
      goal: goal.trim(),
      createdAt: new Date().toISOString(),
    });
    setSaving(false);
    navigation.replace("ForecastReveal");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SproutTip
        mood="happy"
        text="Hi! I'm Sprout. No judgment here — everyone doomscrolls. Let's just find out what that time could become instead."
      />

      <Text style={[styles.label, styles.spacedLabel]}>What should we call you?</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={[styles.label, styles.spacedLabel]}>
        What do you want to get better at in the next 30 days?
      </Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. learn guitar, get better at DSA, write my novel"
        placeholderTextColor={colors.textSecondary}
        value={goal}
        onChangeText={setGoal}
      />

      <TouchableOpacity
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        disabled={!canContinue || saving}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>{saving ? "Saving…" : "Continue"}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 64,
    gap: 12,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  spacedLabel: {
    marginTop: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  button: {
    marginTop: "auto",
    marginBottom: 40,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
});
