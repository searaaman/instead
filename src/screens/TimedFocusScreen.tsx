import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../lib/theme";
import { completeTask } from "../lib/storage";

type Props = NativeStackScreenProps<RootStackParamList, "TimedFocus">;

export default function TimedFocusScreen({ route, navigation }: Props) {
  const { minutes, label = "Focus time", instructions } = route.params;
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [done, setDone] = useState(false);
  const [leftApp, setLeftApp] = useState(false);
  const finishing = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setDone(true);
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  // Leaving the app mid-timer (e.g. to open Instagram anyway) invalidates
  // the run — the point is to actually spend the time on the goal.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active" && !done) setLeftApp(true);
    });
    return () => sub.remove();
  }, [done]);

  async function handleClaim() {
    if (finishing.current) return;
    finishing.current = true;
    const taskLabel = label === "Focus time" ? `${minutes} min focus` : label;
    await completeTask({
      id: `focus-${Date.now()}`,
      type: "timed_focus",
      completedAt: new Date().toISOString(),
      rewardMinutes: minutes,
      label: taskLabel,
    });
    navigation.replace("TaskComplete", { minutes, label: taskLabel });
  }

  function restart() {
    setSecondsLeft(minutes * 60);
    setDone(false);
    setLeftApp(false);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <View style={styles.screen}>
      {!done && !leftApp && (
        <>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.timer}>
            {mm}:{ss}
          </Text>
          <Text style={styles.hint}>
            {instructions ?? "Stay in the app. Put your phone down and go work on it."}
          </Text>
        </>
      )}

      {leftApp && !done && (
        <>
          <Text style={styles.label}>Run interrupted</Text>
          <Text style={styles.hintBig}>You left the app before time was up — that doesn't count.</Text>
          <TouchableOpacity style={styles.button} onPress={restart}>
            <Text style={styles.buttonText}>Start over</Text>
          </TouchableOpacity>
        </>
      )}

      {done && (
        <>
          <Text style={styles.doneEmoji}>✅</Text>
          <Text style={styles.label}>Nice work</Text>
          <Text style={styles.hintBig}>+{minutes} min unlocked</Text>
          <TouchableOpacity style={styles.button} onPress={handleClaim}>
            <Text style={styles.buttonText}>Claim it</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.cancel} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  timer: {
    color: colors.textPrimary,
    fontSize: 64,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  hintBig: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  doneEmoji: {
    fontSize: 48,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.hope,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancel: {
    position: "absolute",
    bottom: 40,
  },
  cancelText: {
    color: colors.textSecondary,
  },
});
