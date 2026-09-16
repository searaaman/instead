import { useEffect, useRef, useState } from "react";
import { GestureResponderEvent, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../lib/theme";
import { completeTask, getDrawAvailability, saveDrawing, type DrawAvailability, type DrawStroke } from "../lib/storage";
import {
  DRAW_MAX_COUNTED_SECONDS,
  DRAW_MIN_POINTS,
  DRAW_MIN_SECONDS,
  DRAW_PROMPTS,
  DRAW_REWARD_PER_MINUTE,
} from "../lib/tasks";

type Props = NativeStackScreenProps<RootStackParamList, "Draw">;
type Point = { x: number; y: number };

const PALETTE = ["#1F2430", "#E2694A", "#F2B705", "#1F9D63", "#5B6EE8", "#8A4FBE", "#D64C8C", "#FFFFFF"];
const BRUSH_SIZES: { label: string; width: number }[] = [
  { label: "S", width: 2 },
  { label: "M", width: 4 },
  { label: "L", width: 8 },
];

function computeReward(elapsedSeconds: number): number {
  const counted = Math.min(elapsedSeconds, DRAW_MAX_COUNTED_SECONDS);
  return Math.round((counted / 60) * DRAW_REWARD_PER_MINUTE);
}

export default function DrawScreen({ navigation }: Props) {
  const [availability, setAvailability] = useState<DrawAvailability | null>(null);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const currentStroke = useRef<Point[]>([]);
  const [, forceRender] = useState(0);
  const [saving, setSaving] = useState(false);
  const [color, setColor] = useState(PALETTE[0]);
  const [brushWidth, setBrushWidth] = useState(BRUSH_SIZES[1].width);
  const [promptIndex, setPromptIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const hasDrawnAnything = useRef(false);

  useEffect(() => {
    getDrawAvailability().then(setAvailability);
  }, []);

  // Counts up only while this screen is actually mounted and in the
  // foreground — a plain setInterval like this pauses when the app
  // backgrounds, so there's no way to inflate the reward by starting a
  // session and walking away.
  useEffect(() => {
    if (!availability?.available) return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [availability?.available]);

  const totalPointsThisShape = strokes.reduce((sum, s) => sum + s.points.length, 0);
  if (totalPointsThisShape >= DRAW_MIN_POINTS) hasDrawnAnything.current = true;

  const reward = computeReward(elapsedSeconds);
  const canClaim = hasDrawnAnything.current && elapsedSeconds >= DRAW_MIN_SECONDS;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        currentStroke.current = [{ x: locationX, y: locationY }];
        forceRender((n) => n + 1);
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        currentStroke.current = [...currentStroke.current, { x: locationX, y: locationY }];
        forceRender((n) => n + 1);
      },
      onPanResponderRelease: () => {
        // Capture the finished points into a local first — setStrokes'
        // updater runs slightly later, and by then `currentStroke.current`
        // would already be reset to [], silently dropping every stroke.
        // That was the actual bug: the drawing "vanished" on lifting your
        // finger because the just-drawn stroke was saved as empty.
        const finishedPoints = currentStroke.current;
        currentStroke.current = [];
        if (finishedPoints.length > 1) {
          setStrokes((prev) => [...prev, { points: finishedPoints, color, width: brushWidth }]);
        }
        forceRender((n) => n + 1);
      },
    })
  ).current;

  function clear() {
    setStrokes([]);
    currentStroke.current = [];
  }

  function undo() {
    setStrokes((prev) => prev.slice(0, -1));
  }

  function nextShape() {
    setPromptIndex((i) => (i + 1) % DRAW_PROMPTS.length);
    clear();
  }

  async function handleClaim() {
    setSaving(true);
    await saveDrawing(strokes);
    const taskLabel = `Drew ${DRAW_PROMPTS[promptIndex]}`;
    await completeTask({
      id: `draw-${Date.now()}`,
      type: "draw",
      completedAt: new Date().toISOString(),
      rewardMinutes: reward,
      label: taskLabel,
    });
    navigation.replace("TaskComplete", { minutes: reward, label: taskLabel });
  }

  if (!availability) {
    return <View style={styles.screen} />;
  }

  if (!availability.available) {
    return (
      <View style={styles.screen}>
        <Text style={styles.blockedEmoji}>✏️</Text>
        <Text style={styles.title}>
          {availability.reason === "daily_limit" ? "Used up for today" : "Give it a bit"}
        </Text>
        <Text style={styles.hint}>
          {availability.reason === "daily_limit"
            ? "Drawing is capped for the day so it can't be spammed for free time — plenty of other habits to try, or come back tomorrow."
            : `You can draw again in ${availability.cooldownRemainingMinutes} min.`}
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const ss = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>&larr; Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={undo} disabled={strokes.length === 0}>
            <Text style={[styles.headerAction, strokes.length === 0 && styles.headerActionDisabled]}>
              Undo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clear}>
            <Text style={styles.headerAction}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>Try drawing: {DRAW_PROMPTS[promptIndex]}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.timer}>
          ⏱ {mm}:{ss}
        </Text>
        <Text style={styles.rewardPreview}>+{reward} min so far</Text>
      </View>

      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {strokes.map((stroke, i) => (
            <Polyline
              key={i}
              points={stroke.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentStroke.current.length > 0 && (
            <Polyline
              points={currentStroke.current.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={brushWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </View>

      <View style={styles.toolRow}>
        <View style={styles.swatchRow}>
          {PALETTE.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.swatch,
                { backgroundColor: c },
                c === color && styles.swatchSelected,
                c === "#FFFFFF" && styles.swatchBorder,
              ]}
            />
          ))}
        </View>
        <View style={styles.brushRow}>
          {BRUSH_SIZES.map((b) => (
            <TouchableOpacity
              key={b.label}
              onPress={() => setBrushWidth(b.width)}
              style={[styles.brushOption, b.width === brushWidth && styles.brushOptionSelected]}
            >
              <View style={{ width: b.width, height: b.width, borderRadius: b.width / 2, backgroundColor: colors.textPrimary }} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.nextButton} onPress={nextShape}>
          <Text style={styles.nextButtonText}>Next shape →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !canClaim && styles.buttonDisabled]}
          disabled={!canClaim || saving}
          onPress={handleClaim}
        >
          <Text style={styles.buttonText}>
            {canClaim ? `Finish & claim +${reward} min` : `Draw for ${DRAW_MIN_SECONDS}s to claim`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  back: {
    color: colors.welcomeStrong,
    fontWeight: "700",
  },
  headerAction: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  headerActionDisabled: {
    opacity: 0.35,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  timer: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  rewardPreview: {
    color: colors.hope,
    fontWeight: "800",
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  blockedEmoji: {
    fontSize: 44,
    marginTop: 100,
  },
  canvas: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 12,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: colors.hope,
  },
  swatchBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  brushRow: {
    flexDirection: "row",
    gap: 6,
  },
  brushOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brushOptionSelected: {
    borderColor: colors.hope,
    borderWidth: 2,
  },
  actionRow: {
    gap: 8,
  },
  nextButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.todaySoft,
  },
  nextButtonText: {
    color: colors.today,
    fontWeight: "700",
    fontSize: 14,
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
