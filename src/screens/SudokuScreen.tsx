import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, fonts } from "../lib/theme";
import { completeTask } from "../lib/storage";
import { SUDOKU_PUZZLES } from "../lib/tasks";
import { isGridFull, isValidSudoku } from "../lib/sudoku";

type Props = NativeStackScreenProps<RootStackParamList, "Sudoku">;
type CellPos = { row: number; col: number };

export default function SudokuScreen({ route, navigation }: Props) {
  const puzzle = SUDOKU_PUZZLES.find((p) => p.id === route.params.puzzleId)!;
  const [grid, setGrid] = useState<number[][]>(() => puzzle.grid.map((row) => [...row]));
  const [selected, setSelected] = useState<CellPos | null>(null);
  const [status, setStatus] = useState<"editing" | "invalid" | "solved">("editing");
  const [saving, setSaving] = useState(false);

  const isGiven = useMemo(
    () => puzzle.grid.map((row) => row.map((cell) => cell !== 0)),
    [puzzle]
  );

  function selectCell(row: number, col: number) {
    if (isGiven[row][col]) return;
    setSelected({ row, col });
    if (status !== "editing") setStatus("editing");
  }

  function setNumber(n: number) {
    if (!selected) return;
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[selected.row][selected.col] = n;
      return next;
    });
    if (status !== "editing") setStatus("editing");
  }

  function clearCell() {
    setNumber(0);
  }

  function handleCheck() {
    if (!isGridFull(grid)) {
      setStatus("invalid");
      return;
    }
    setStatus(isValidSudoku(grid) ? "solved" : "invalid");
  }

  async function handleClaim() {
    setSaving(true);
    await completeTask({
      id: `sudoku-${puzzle.id}-${Date.now()}`,
      type: "sudoku",
      completedAt: new Date().toISOString(),
      rewardMinutes: puzzle.rewardMinutes,
      label: `Sudoku (${puzzle.label})`,
    });
    navigation.replace("TaskComplete", { minutes: puzzle.rewardMinutes, label: `Sudoku — ${puzzle.label}` });
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>&larr; Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{puzzle.label} Sudoku</Text>
      <Text style={styles.subtitle}>Fill every row, column, and box with 1–9. No guessing past — has to actually check out.</Text>

      <View style={styles.grid}>
        {grid.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((value, c) => {
              const given = isGiven[r][c];
              const isSelected = selected?.row === r && selected?.col === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.cell,
                    c % 3 === 0 && styles.cellBorderLeft,
                    r % 3 === 0 && styles.cellBorderTop,
                    c === 8 && styles.cellBorderRight,
                    r === 8 && styles.cellBorderBottom,
                    isSelected && styles.cellSelected,
                  ]}
                  onPress={() => selectCell(r, c)}
                  disabled={given}
                >
                  <Text style={[styles.cellText, given && styles.cellTextGiven]}>
                    {value !== 0 ? value : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {status === "invalid" && <Text style={styles.statusInvalid}>Not quite — some numbers repeat somewhere. Keep going.</Text>}
      {status === "solved" && <Text style={styles.statusSolved}>Solved! Nicely done.</Text>}

      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <TouchableOpacity key={n} style={styles.numberKey} onPress={() => setNumber(n)}>
            <Text style={styles.numberKeyText}>{n}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.numberKey} onPress={clearCell}>
          <Text style={styles.numberKeyText}>×</Text>
        </TouchableOpacity>
      </View>

      {status === "solved" ? (
        <TouchableOpacity style={styles.claimButton} onPress={handleClaim} disabled={saving}>
          <Text style={styles.claimButtonText}>
            {saving ? "Claiming…" : `Claim +${puzzle.rewardMinutes} min`}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.checkButton} onPress={handleCheck}>
          <Text style={styles.checkButtonText}>Check</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 56,
    gap: 8,
  },
  back: {
    color: colors.welcomeStrong,
    fontFamily: fonts.bodyBold,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.headingBold,
    fontSize: 22,
    marginTop: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: 8,
  },
  grid: {
    alignSelf: "center",
    borderColor: colors.textPrimary,
  },
  gridRow: {
    flexDirection: "row",
  },
  cell: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.surface,
  },
  cellBorderLeft: { borderLeftWidth: 2, borderLeftColor: colors.textPrimary },
  cellBorderTop: { borderTopWidth: 2, borderTopColor: colors.textPrimary },
  cellBorderRight: { borderRightWidth: 2, borderRightColor: colors.textPrimary },
  cellBorderBottom: { borderBottomWidth: 2, borderBottomColor: colors.textPrimary },
  cellSelected: {
    backgroundColor: colors.primarySoft,
  },
  cellText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.primary,
  },
  cellTextGiven: {
    color: colors.textPrimary,
    fontFamily: fonts.headingBold,
  },
  statusInvalid: {
    color: colors.welcomeStrong,
    fontFamily: fonts.bodySemiBold,
    textAlign: "center",
    marginTop: 8,
  },
  statusSolved: {
    color: colors.primary,
    fontFamily: fonts.bodyExtraBold,
    textAlign: "center",
    marginTop: 8,
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  numberKey: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numberKeyText: {
    fontFamily: fonts.headingBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  checkButton: {
    marginTop: "auto",
    marginBottom: 32,
    backgroundColor: colors.info,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  checkButtonText: {
    color: "#fff",
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  claimButton: {
    marginTop: "auto",
    marginBottom: 32,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  claimButtonText: {
    color: "#fff",
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
});
