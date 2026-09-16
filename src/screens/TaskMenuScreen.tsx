import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, fonts } from "../lib/theme";
import { CODE_PROBLEMS, FOCUS_OPTIONS, SUDOKU_PUZZLES } from "../lib/tasks";
import { SproutTip } from "../components/Sprout";

type Props = NativeStackScreenProps<RootStackParamList, "TaskMenu">;

export default function TaskMenuScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>&larr; Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Earn some time</Text>

      <SproutTip
        mood="happy"
        text="Pick one below and finish it — Sudoku and the code challenges are checked for real, so they pay the best."
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>🔢 Sudoku</Text>
        <Text style={styles.sectionHint}>A real puzzle — has to actually check out to count.</Text>
        {SUDOKU_PUZZLES.map((puzzle, index) => (
          <TouchableOpacity
            key={puzzle.id}
            style={[styles.problemRow, index === 0 && styles.problemRowFirst]}
            onPress={() => navigation.navigate("Sudoku", { puzzleId: puzzle.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.problemTitle}>{puzzle.label}</Text>
              <Text style={styles.problemDifficulty}>{puzzle.difficulty}</Text>
            </View>
            <Text style={styles.problemReward}>+{puzzle.rewardMinutes} min</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>💻 Code challenge</Text>
        <Text style={styles.sectionHint}>Solve it for real — your code actually runs.</Text>
        {CODE_PROBLEMS.map((problem, index) => (
          <TouchableOpacity
            key={problem.id}
            style={[styles.problemRow, index === 0 && styles.problemRowFirst]}
            onPress={() => navigation.navigate("CodeChallenge", { problemId: problem.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.problemTitle}>{problem.title}</Text>
              <Text style={styles.problemDifficulty}>{problem.difficulty}</Text>
            </View>
            <Text style={styles.problemReward}>+{problem.rewardMinutes} min</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>⏱️ Timed focus</Text>
        <Text style={styles.sectionHint}>Spend the time on your goal. Earn it back 1:1.</Text>
        <View style={styles.optionRow}>
          {FOCUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.minutes}
              style={styles.optionChip}
              onPress={() => navigation.navigate("TimedFocus", { minutes: opt.minutes })}
            >
              <Text style={styles.optionChipText}>{opt.minutes} min</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("HobbyPicker")}>
        <Text style={styles.cardLabel}>🎨 Small hobbies</Text>
        <Text style={styles.cardHint}>
          Draw, journal, a quick language quiz, or read something. Lower payout — some of these
          are easier to fake than a puzzle.
        </Text>
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
    paddingTop: 56,
    paddingBottom: 40,
    gap: 14,
  },
  back: {
    color: colors.welcomeStrong,
    fontFamily: fonts.bodyBold,
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.headingExtraBold,
    fontSize: 26,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
  },
  sectionHint: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionChip: {
    backgroundColor: colors.todaySoft,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  optionChipText: {
    color: colors.today,
    fontFamily: fonts.bodyBold,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
  },
  cardLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
  },
  cardHint: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  problemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  problemRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  problemTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
  },
  problemDifficulty: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 12,
    textTransform: "capitalize",
  },
  problemReward: {
    color: colors.hope,
    fontFamily: fonts.bodyExtraBold,
  },
});
