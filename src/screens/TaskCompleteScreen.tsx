import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, fonts } from "../lib/theme";
import Sprout from "../components/Sprout";

type Props = NativeStackScreenProps<RootStackParamList, "TaskComplete">;

// Every task screen lands here instead of jumping straight back to the
// dashboard — a first-time user finishing a task with no confirmation at
// all has no way to tell what just happened or that it worked. One clear
// "here's what you earned" moment, used everywhere, fixes that.
export default function TaskCompleteScreen({ route, navigation }: Props) {
  const { minutes, label } = route.params;

  return (
    <View style={styles.screen}>
      <Sprout size={88} mood="excited" />
      <Text style={styles.title}>Nice work!</Text>
      <Text style={styles.reward}>+{minutes} min</Text>
      <Text style={styles.body}>
        {label ? `"${label}" is done — that time's unlocked now.` : "That time's unlocked now."}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Dashboard")}>
        <Text style={styles.buttonText}>Back to dashboard</Text>
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
    paddingHorizontal: 32,
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.headingBold,
    fontSize: 22,
    marginTop: 8,
  },
  reward: {
    color: colors.primary,
    fontFamily: fonts.headingExtraBold,
    fontSize: 48,
  },
  body: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
});
