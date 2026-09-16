import { Platform } from "react-native";
import UsageStats, { UsageIntervalType, type AppUsage } from "@antardev/react-native-usage-stats";

export function isSupported(): boolean {
  return Platform.OS === "android";
}

export function isPermissionGranted(): boolean {
  if (!isSupported()) return false;
  try {
    return UsageStats.isPermissionGranted();
  } catch {
    return false;
  }
}

// Opens Android's system "Usage access" settings screen. There's no
// callback for when the user comes back — the caller should re-check
// isPermissionGranted() when the app regains focus.
export function requestPermission(): void {
  if (!isSupported()) return;
  UsageStats.requestPermission();
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getTodayUsage(): Promise<AppUsage[]> {
  if (!isSupported() || !isPermissionGranted()) return [];
  return UsageStats.queryUsageStats({
    startTime: startOfToday(),
    endTime: Date.now(),
    interval: UsageIntervalType.INTERVAL_DAILY,
  });
}

export async function getTodayMinutesForPackage(packageName: string): Promise<number> {
  const usage = await getTodayUsage();
  const entry = usage.find((u) => u.packageName === packageName);
  if (!entry) return 0;
  return Math.round(entry.totalTimeInForeground / 60000);
}

// Sums today's foreground time across whichever apps the user chose to
// block — not tied to any one named app, since blocking now covers
// anything they pick.
export async function getTodayMinutesForPackages(packageNames: string[]): Promise<number> {
  if (packageNames.length === 0) return 0;
  const usage = await getTodayUsage();
  const wanted = new Set(packageNames);
  return usage
    .filter((u) => wanted.has(u.packageName))
    .reduce((sum, u) => sum + Math.round(u.totalTimeInForeground / 60000), 0);
}
