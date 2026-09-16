import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../lib/theme";
import { isPermissionGranted, isSupported, requestPermission } from "../lib/usageStats";
import { isAccessibilityServiceEnabled, openAccessibilitySettings } from "../lib/appBlocker";

type Props = NativeStackScreenProps<RootStackParamList, "GrantAccess">;

export default function GrantAccessScreen({ navigation }: Props) {
  const [usageGranted, setUsageGranted] = useState(false);
  const [accessibilityGranted, setAccessibilityGranted] = useState(false);
  const appState = useRef(AppState.currentState);

  const refresh = useCallback(() => {
    setUsageGranted(isPermissionGranted());
    setAccessibilityGranted(isAccessibilityServiceEnabled());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        refresh();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refresh]);

  const unsupported = !isSupported();

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>LAST STEP</Text>
      <Text style={styles.title}>Turn on the two permissions</Text>
      <Text style={styles.subtitle}>You just saw why — this is where you actually grant them.</Text>

      <View style={styles.item}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>👀 Usage access</Text>
          <Text style={usageGranted ? styles.statusDone : styles.statusPending}>
            {usageGranted ? "Done" : "Needed"}
          </Text>
        </View>
        {!usageGranted && (
          <TouchableOpacity style={styles.itemButton} onPress={requestPermission} disabled={unsupported}>
            <Text style={styles.itemButtonText}>Grant usage access</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.item}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>🔔 Real blocking</Text>
          <Text style={accessibilityGranted ? styles.statusDone : styles.statusPending}>
            {accessibilityGranted ? "Done" : "Needed"}
          </Text>
        </View>
        {!accessibilityGranted && (
          <TouchableOpacity
            style={styles.itemButton}
            onPress={openAccessibilitySettings}
            disabled={unsupported}
          >
            <Text style={styles.itemButtonText}>Open Accessibility settings</Text>
          </TouchableOpacity>
        )}
      </View>

      {unsupported && (
        <Text style={styles.hint}>
          These need an Android device — you can still use the in-app dashboard without them.
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Dashboard")}>
        <Text style={styles.buttonText}>
          {usageGranted && accessibilityGranted ? "All set — let's go" : "Continue anyway"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 64,
    gap: 14,
  },
  eyebrow: {
    color: colors.welcomeStrong,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  statusDone: {
    color: colors.hope,
    fontWeight: "800",
    fontSize: 13,
  },
  statusPending: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  itemButton: {
    backgroundColor: colors.welcomeSoft,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  itemButtonText: {
    color: colors.welcomeStrong,
    fontWeight: "700",
    fontSize: 14,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  button: {
    marginTop: "auto",
    marginBottom: 40,
    backgroundColor: colors.hope,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
