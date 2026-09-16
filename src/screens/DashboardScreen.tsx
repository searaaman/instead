import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RNLauncherKitHelper } from "react-native-launcher-kit";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import {
  getActiveUnlock,
  getTodayEarnedMinutes,
  loadBlockedApps,
  loadOnboarding,
  type BlockedApp,
  type OnboardingData,
  type UnlockSession,
} from "../lib/storage";
import {
  getTodayMinutesForPackages,
  isPermissionGranted,
  isSupported,
  requestPermission,
} from "../lib/usageStats";
import { forecastHoursOverDays, ILLUSTRATIVE_DAILY_MINUTES } from "../lib/forecast";
import {
  consumeSettingsInterceptPending,
  isAccessibilityServiceEnabled,
  isBlockerSupported,
  openAccessibilitySettings,
  syncBlockedPackages,
  syncUnlockExpiresAt,
} from "../lib/appBlocker";
import { colors, fonts } from "../lib/theme";
import Sprout from "../components/Sprout";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [granted, setGranted] = useState(false);
  const [realMinutes, setRealMinutes] = useState<number | null>(null);
  const [unlock, setUnlock] = useState<UnlockSession | null>(null);
  const [earnedToday, setEarnedToday] = useState(0);
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [blockerEnabled, setBlockerEnabled] = useState(false);
  const appState = useRef(AppState.currentState);

  const refresh = useCallback(async () => {
    const data = await loadOnboarding();
    setOnboarding(data);

    const apps = await loadBlockedApps();
    setBlockedApps(apps);

    const hasPermission = isPermissionGranted();
    setGranted(hasPermission);

    if (hasPermission && apps.length > 0) {
      const minutes = await getTodayMinutesForPackages(apps.map((a) => a.packageName));
      setRealMinutes(minutes);
    }

    const activeUnlock = await getActiveUnlock();
    setUnlock(activeUnlock);
    setEarnedToday(await getTodayEarnedMinutes());
    setBlockerEnabled(isAccessibilityServiceEnabled());

    // Defensive re-sync: the accessibility service reads its own copy of
    // this data from native SharedPreferences (it can't reach into
    // AsyncStorage), so keep it aligned with JS state on every load.
    syncBlockedPackages(apps.map((a) => a.packageName));
    syncUnlockExpiresAt(activeUnlock ? new Date(activeUnlock.expiresAt).getTime() : 0);
  }, []);

  // Covers first mount and any in-app navigation back to this screen —
  // this is also how we notice a task was just completed on another screen.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Covers the actual case that matters here: the user leaves the app
  // entirely (Android opens its own Settings activity over us to grant
  // "usage access"), then comes back. That's an app-background/foreground
  // transition, not a react-navigation focus change, so useFocusEffect
  // alone never re-fires for it — nothing appeared to happen after
  // granting permission because of this.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        if (consumeSettingsInterceptPending()) {
          navigation.navigate("KeepProtection");
        } else {
          refresh();
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refresh, navigation]);

  const displayMinutes = realMinutes ?? ILLUSTRATIVE_DAILY_MINUTES;
  const usingRealData = realMinutes !== null;
  const forecastHours = forecastHoursOverDays(displayMinutes, 30);
  const unlocked = !!unlock;
  const expiresLabel = unlock
    ? new Date(unlock.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.greetingRow}>
        <Sprout size={44} mood={unlocked ? "excited" : "happy"} />
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{onboarding?.name ? `HI ${onboarding.name.toUpperCase()} — YOUR GOAL` : "YOUR GOAL"}</Text>
          <Text style={styles.goal}>{onboarding?.goal ?? "…"}</Text>
        </View>
      </View>

      <View style={[styles.card, unlocked ? styles.unlockedCard : styles.lockedCard]}>
        <View style={styles.gateHeader}>
          <Text style={styles.gateLabel}>{unlocked ? "🔓 Unlocked" : "🔒 Locked"}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SelectApps")}>
            <Text style={styles.editLink}>Edit apps</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.gateSub}>
          {unlocked
            ? `Open until ${expiresLabel}`
            : blockedApps.length > 0
              ? `${blockedApps.length} app${blockedApps.length === 1 ? "" : "s"} locked · earned ${earnedToday} min today`
              : "No apps locked yet — tap \"Edit apps\" to pick some"}
        </Text>

        {unlocked && blockedApps.length > 0 && (
          <View style={styles.appList}>
            {blockedApps.map((app) => (
              <TouchableOpacity
                key={app.packageName}
                style={styles.appRow}
                onPress={() => RNLauncherKitHelper.launchApplication(app.packageName)}
              >
                <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                <Text style={styles.appLabel}>{app.label}</Text>
                <Text style={styles.openText}>Open</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!unlocked && (
          <TouchableOpacity style={styles.gateButton} onPress={() => navigation.navigate("TaskMenu")}>
            <Text style={styles.gateButtonText}>Earn time</Text>
          </TouchableOpacity>
        )}
      </View>

      {isBlockerSupported() && !blockerEnabled && blockedApps.length > 0 && (
        <TouchableOpacity style={styles.blockerBanner} onPress={openAccessibilitySettings}>
          <Text style={styles.blockerBannerTitle}>Turn on real blocking</Text>
          <Text style={styles.blockerBannerBody}>
            Right now the lock only works from this dashboard. Enable Accessibility access so
            opening a locked app anywhere on your phone sends you here automatically.
          </Text>
          <Text style={styles.blockerBannerCta}>Open Accessibility settings →</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.card, styles.todayCard]}>
        <Text style={styles.cardLabel}>
          {blockedApps.length > 0 ? "Locked apps, today" : "A typical scroll session"}
        </Text>
        <Text style={styles.todayValue}>{displayMinutes} min</Text>
        <Text style={styles.cardSub}>
          {usingRealData
            ? "Measured on this device, across your locked apps"
            : isSupported()
              ? blockedApps.length > 0
                ? "Estimated — grant usage access below for your real number"
                : `Illustrative — pick apps to lock for your real number`
              : "Estimated — real tracking needs an Android device"}
        </Text>
      </View>

      {isSupported() && !granted && blockedApps.length > 0 && (
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant usage access</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.card, styles.hopeCard]}>
        <Text style={styles.hopeLabel}>In the next 30 days</Text>
        <Text style={styles.hopeValue}>{forecastHours}h</Text>
        <Text style={styles.hopeSub}>
          At {displayMinutes} min/day, that's {forecastHours} hours you could put toward{" "}
          <Text style={styles.goalInline}>{onboarding?.goal}</Text> instead.
        </Text>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 48 : 80,
    paddingBottom: 40,
    gap: 16,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eyebrow: {
    color: colors.welcomeStrong,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  goal: {
    color: colors.textPrimary,
    fontFamily: fonts.headingExtraBold,
    fontSize: 22,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 4,
  },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardSub: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  lockedCard: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  unlockedCard: {
    backgroundColor: colors.hopeSoft,
    borderColor: colors.hopeSoft,
  },
  gateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gateLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.headingBold,
    fontSize: 18,
  },
  editLink: {
    color: colors.today,
    fontWeight: "700",
    fontSize: 13,
  },
  gateSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  gateButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  gateButtonText: {
    color: "#fff",
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  appList: {
    gap: 8,
    marginTop: 4,
  },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  openText: {
    color: colors.hope,
    fontWeight: "700",
    fontSize: 13,
  },
  blockerBanner: {
    backgroundColor: colors.welcomeSoft,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  blockerBannerTitle: {
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 15,
  },
  blockerBannerBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  blockerBannerCta: {
    color: colors.welcomeStrong,
    fontWeight: "700",
    fontSize: 13,
    marginTop: 4,
  },
  todayCard: {
    backgroundColor: colors.todaySoft,
    borderColor: colors.todaySoft,
  },
  todayValue: {
    color: colors.info,
    fontFamily: fonts.headingExtraBold,
    fontSize: 32,
  },
  permissionButton: {
    backgroundColor: colors.welcomeSoft,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  permissionButtonText: {
    color: colors.welcomeStrong,
    fontWeight: "700",
    fontSize: 15,
  },
  hopeCard: {
    backgroundColor: colors.hopeSoft,
    borderColor: colors.hopeSoft,
  },
  hopeLabel: {
    color: colors.hope,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  hopeValue: {
    color: colors.hope,
    fontFamily: fonts.headingExtraBold,
    fontSize: 40,
  },
  hopeSub: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  goalInline: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});
