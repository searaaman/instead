import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../lib/theme";
import { completeTask } from "../lib/storage";
import { buildLanguageQuiz, LANGUAGE_PASS_THRESHOLD, LANGUAGE_REWARD_MINUTES } from "../lib/tasks";

type Props = NativeStackScreenProps<RootStackParamList, "LanguageQuiz">;

export default function LanguageQuizScreen({ navigation }: Props) {
  const quiz = useMemo(() => buildLanguageQuiz(5), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const current = quiz[index];
  const passed = correctCount >= LANGUAGE_PASS_THRESHOLD;

  function handleAnswer(option: string) {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === current.word.translation;
    if (isCorrect) setCorrectCount((c) => c + 1);

    setTimeout(() => {
      if (index + 1 < quiz.length) {
        setIndex((i) => i + 1);
        setSelected(null);
      } else {
        setFinished(true);
      }
    }, 700);
  }

  async function handleClaim() {
    setSaving(true);
    await completeTask({
      id: `language-${Date.now()}`,
      type: "language_quiz",
      completedAt: new Date().toISOString(),
      rewardMinutes: LANGUAGE_REWARD_MINUTES,
      label: "Spanish vocab quiz",
    });
    navigation.replace("TaskComplete", { minutes: LANGUAGE_REWARD_MINUTES, label: "Spanish vocab quiz" });
  }

  function retry() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <View style={styles.screen}>
        <Text style={styles.resultEmoji}>{passed ? "✅" : "📚"}</Text>
        <Text style={styles.title}>
          {correctCount} / {quiz.length} correct
        </Text>
        <Text style={styles.hint}>
          {passed
            ? "Nice — that's a pass."
            : `Need at least ${LANGUAGE_PASS_THRESHOLD} right. Give it another go.`}
        </Text>
        {passed ? (
          <TouchableOpacity style={styles.button} onPress={handleClaim} disabled={saving}>
            <Text style={styles.buttonText}>
              {saving ? "Claiming…" : `Claim +${LANGUAGE_REWARD_MINUTES} min`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={retry}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>&larr; Back</Text>
      </TouchableOpacity>

      <Text style={styles.progress}>
        Word {index + 1} of {quiz.length} · {current.word.language}
      </Text>
      <Text style={styles.word}>{current.word.word}</Text>
      <Text style={styles.hint}>What does this mean?</Text>

      <View style={styles.options}>
        {current.options.map((option) => {
          const isSelected = selected === option;
          const isCorrectOption = option === current.word.translation;
          const showState = selected !== null;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                showState && isCorrectOption && styles.optionCorrect,
                showState && isSelected && !isCorrectOption && styles.optionWrong,
              ]}
              onPress={() => handleAnswer(option)}
              disabled={selected !== null}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
    gap: 10,
    alignItems: "stretch",
  },
  back: {
    color: colors.welcomeStrong,
    fontWeight: "700",
    marginBottom: 8,
  },
  progress: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  word: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    marginVertical: 8,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  options: {
    gap: 10,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  optionCorrect: {
    backgroundColor: colors.hopeSoft,
    borderColor: colors.hope,
  },
  optionWrong: {
    backgroundColor: colors.welcomeSoft,
    borderColor: colors.welcome,
  },
  optionText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  resultEmoji: {
    fontSize: 48,
    textAlign: "center",
    marginTop: 120,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
  },
  button: {
    marginTop: 20,
    marginHorizontal: 24,
    backgroundColor: colors.hope,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancel: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
});
