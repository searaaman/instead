import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../lib/theme";
import { CODE_PROBLEMS } from "../lib/tasks";
import { runAgainstProblem, type RunResult } from "../lib/judge0";
import { completeTask } from "../lib/storage";

type Props = NativeStackScreenProps<RootStackParamList, "CodeChallenge">;

export default function CodeChallengeScreen({ route, navigation }: Props) {
  const problem = CODE_PROBLEMS.find((p) => p.id === route.params.problemId)!;
  const [code, setCode] = useState(problem.starterCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [claiming, setClaiming] = useState(false);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    try {
      const r = await runAgainstProblem(problem, code);
      setResult(r);
    } catch (err: any) {
      setResult({
        passed: false,
        stdout: "",
        stderr: err?.message ?? "Could not reach the code runner. Check your connection.",
        compileOutput: null,
        statusDescription: "Error",
      });
    } finally {
      setRunning(false);
    }
  }

  async function handleClaim() {
    setClaiming(true);
    await completeTask({
      id: `code-${problem.id}-${Date.now()}`,
      type: "code_challenge",
      completedAt: new Date().toISOString(),
      rewardMinutes: problem.rewardMinutes,
      label: problem.title,
    });
    navigation.replace("TaskComplete", { minutes: problem.rewardMinutes, label: problem.title });
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>&larr; Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{problem.title}</Text>
        <Text style={styles.difficulty}>
          {problem.difficulty} · +{problem.rewardMinutes} min
        </Text>
        <Text style={styles.prompt}>{problem.prompt}</Text>

        <TextInput
          style={styles.editor}
          value={code}
          onChangeText={setCode}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
        />

        <TouchableOpacity style={styles.runButton} onPress={handleRun} disabled={running}>
          <Text style={styles.runButtonText}>{running ? "Running…" : "Run"}</Text>
        </TouchableOpacity>

        {result && (
          <View style={[styles.resultCard, result.passed ? styles.resultPass : styles.resultFail]}>
            <Text style={styles.resultTitle}>
              {result.passed ? "✅ Passed" : `❌ ${result.statusDescription}`}
            </Text>
            {!!result.stdout && <Text style={styles.resultText}>stdout: {result.stdout}</Text>}
            {!!result.stderr && <Text style={styles.resultText}>{result.stderr}</Text>}
            {!!result.compileOutput && <Text style={styles.resultText}>{result.compileOutput}</Text>}
          </View>
        )}

        {result?.passed && (
          <TouchableOpacity style={styles.claimButton} onPress={handleClaim} disabled={claiming}>
            <Text style={styles.claimButtonText}>
              {claiming ? "Claiming…" : `Claim +${problem.rewardMinutes} min`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  back: {
    color: colors.welcomeStrong,
    fontWeight: "700",
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  difficulty: {
    color: colors.hope,
    fontWeight: "700",
    textTransform: "capitalize",
    fontSize: 13,
    marginBottom: 6,
  },
  prompt: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  editor: {
    backgroundColor: "#1f2430",
    color: "#e7ecf5",
    borderRadius: 12,
    padding: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    minHeight: 160,
    textAlignVertical: "top",
  },
  runButton: {
    backgroundColor: colors.today,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  runButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  resultCard: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  resultPass: {
    backgroundColor: colors.hopeSoft,
  },
  resultFail: {
    backgroundColor: colors.welcomeSoft,
  },
  resultTitle: {
    fontWeight: "800",
    color: colors.textPrimary,
  },
  resultText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  claimButton: {
    backgroundColor: colors.hope,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  claimButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
