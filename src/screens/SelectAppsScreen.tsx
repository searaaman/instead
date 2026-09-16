import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { InstalledApps } from "react-native-launcher-kit";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../lib/theme";
import { loadOnboarding, saveBlockedApps, type OnboardingData } from "../lib/storage";

type Props = NativeStackScreenProps<RootStackParamList, "SelectApps">;

const OWN_PACKAGE = "com.instead.app";

interface AppDetail {
  label: string;
  packageName: string;
  icon: string;
}

export default function SelectAppsScreen({ navigation, route }: Props) {
  const fromOnboarding = route.params?.fromOnboarding ?? false;
  const [apps, setApps] = useState<AppDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);

  useEffect(() => {
    loadOnboarding().then(setOnboarding);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") {
      setError("App blocking needs an Android device.");
      return;
    }
    InstalledApps.getSortedApps({ includeVersion: false, includeAccentColor: false })
      .then((list) => setApps(list.filter((a) => a.packageName !== OWN_PACKAGE)))
      .catch(() => setError("Couldn't load installed apps."));
  }, []);

  const filtered = useMemo(() => {
    if (!apps) return [];
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => a.label.toLowerCase().includes(q));
  }, [apps, search]);

  function toggle(packageName: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(packageName)) next.delete(packageName);
      else next.add(packageName);
      return next;
    });
  }

  async function handleContinue() {
    setSaving(true);
    const chosen = (apps ?? []).filter((a) => selected.has(a.packageName));
    await saveBlockedApps(
      chosen.map((a) => ({ packageName: a.packageName, label: a.label, icon: a.icon }))
    );
    navigation.replace(fromOnboarding ? "GrantAccess" : "Dashboard");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{fromOnboarding ? "ONE MORE THING" : "EDIT LOCKED APPS"}</Text>
      <Text style={styles.title}>
        {fromOnboarding && onboarding?.goal
          ? `Which apps pull you away from ${onboarding.goal}?`
          : "Which apps should stay locked?"}
      </Text>
      <Text style={styles.subtitle}>Pick anything you want gated behind a task first.</Text>

      {!error && (
        <TextInput
          style={styles.search}
          placeholder="Search your apps…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {!error && !apps && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.welcome} />
        </View>
      )}

      {!error && apps && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.packageName}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.packageName);
            return (
              <TouchableOpacity style={styles.row} onPress={() => toggle(item.packageName)}>
                <Image source={{ uri: `data:image/png;base64,${item.icon}` }} style={styles.icon} />
                <Text style={styles.label}>{item.label}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.button, selected.size === 0 && styles.buttonDisabled]}
        disabled={selected.size === 0 || saving}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving…" : `Lock ${selected.size || ""} app${selected.size === 1 ? "" : "s"}`.trim()}
        </Text>
      </TouchableOpacity>

      {!!error && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Dashboard")}>
          <Text style={styles.buttonText}>Skip for now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
    gap: 10,
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
  search: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  error: {
    color: colors.textSecondary,
    marginTop: 20,
    textAlign: "center",
  },
  loading: {
    marginTop: 40,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.hope,
    borderColor: colors.hope,
  },
  checkmark: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
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
