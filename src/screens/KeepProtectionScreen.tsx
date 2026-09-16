import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../lib/theme";
import { loadBlockedApps, type BlockedApp } from "../lib/storage";
import { openAccessibilitySettings, suppressSettingsInterceptFor } from "../lib/appBlocker";

type Props = NativeStackScreenProps<RootStackParamList, "KeepProtection">;

export default function KeepProtectionScreen({ navigation }: Props) {
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);

  useEffect(() => {
    loadBlockedApps().then(setBlockedApps);
  }, []);

  function handleContinueToSettings() {
    // Give them a real window to actually flip the toggle without being
    // bounced back the moment they land on that screen again.
    suppressSettingsInterceptFor(60_000);
    openAccessibilitySettings();
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.emoji}>✋</Text>
      <Text style={styles.title}>Turning off protection?</Text>
      <Text style={styles.body}>
        {blockedApps.length > 0
          ? `${blockedApps.map((a) => a.label).join(", ")} would open immediately from now on — no task, nothing earned.`
          : "Your locked apps would open immediately from now on — no task, nothing earned."}
      </Text>
      <Text style={styles.body}>You can always turn it back on later from the dashboard.</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace("Dashboard")}>
        <Text style={styles.primaryButtonText}>Keep protection on</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueToSettings}>
        <Text style={styles.secondaryButtonText}>Continue to Settings anyway</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    paddingTop: 120,
    gap: 12,
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: colors.hope,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
