import { useMemo, useRef, useState } from "react";
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
import { colors } from "../lib/theme";
import { completeTask } from "../lib/storage";
import { JOURNAL_MIN_WORDS, JOURNAL_PROMPTS, JOURNAL_REWARD_MINUTES } from "../lib/tasks";

type Props = NativeStackScreenProps<RootStackParamList, "Journal">;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function JournalScreen({ navigation }: Props) {
  const prompt = useMemo(() => JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)], []);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const prevLength = useRef(0);

  const wordCount = countWords(text);
  const canClaim = wordCount >= JOURNAL_MIN_WORDS;

  function handleChange(next: string) {
    // A big jump in length from one change event almost always means a
    // paste, not typing — reject it rather than let it silently count.
    if (next.length - prevLength.current > 20) {
      return;
    }
    prevLength.current = next.length;
    setText(next);
  }

  async function handleClaim() {
    setSaving(true);
    await completeTask({
      id: `journal-${Date.now()}`,
      type: "journal",
      completedAt: new Date().toISOString(),
      rewardMinutes: JOURNAL_REWARD_MINUTES,
      label: "Journaled",
    });
    navigation.replace("TaskComplete", { minutes: JOURNAL_REWARD_MINUTES, label: "Journaling" });
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>&larr; Back</Text>
      </TouchableOpacity>

      <Text style={styles.prompt}>{prompt}</Text>
      <Text style={styles.hint}>Write it yourself — pasting is disabled.</Text>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChange}
        multiline
        placeholder="Start typing…"
        placeholderTextColor={colors.textSecondary}
        contextMenuHidden
        autoCorrect
      />

      <View style={styles.footer}>
        <Text style={styles.wordCount}>
          {wordCount} / {JOURNAL_MIN_WORDS} words
        </Text>
        <TouchableOpacity
          style={[styles.button, !canClaim && styles.buttonDisabled]}
          disabled={!canClaim || saving}
          onPress={handleClaim}
        >
          <Text style={styles.buttonText}>
            {canClaim ? `Claim +${JOURNAL_REWARD_MINUTES} min` : "Keep writing…"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    gap: 8,
  },
  back: {
    color: colors.welcomeStrong,
    fontWeight: "700",
    marginBottom: 8,
  },
  prompt: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    textAlignVertical: "top",
  },
  footer: {
    marginTop: 12,
    gap: 8,
  },
  wordCount: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.hope,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
