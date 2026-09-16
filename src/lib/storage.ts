import AsyncStorage from "@react-native-async-storage/async-storage";
import { DRAW_COOLDOWN_MINUTES, DRAW_MAX_USES_PER_DAY, type CompletedTask, type TaskType } from "./tasks";
import { syncBlockedPackages, syncUnlockExpiresAt } from "./appBlocker";

export interface OnboardingData {
  name: string;
  goal: string;
  createdAt: string;
}

export interface UnlockSession {
  unlockedAt: string;
  expiresAt: string;
}

export interface BlockedApp {
  packageName: string;
  label: string;
  icon: string; // base64-encoded icon image, use directly as a data URI
}

export interface DrawStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface SavedDrawing {
  date: string; // yyyy-mm-dd
  strokes: DrawStroke[];
  savedAt: string;
}

const ONBOARDING_KEY = "instead.onboarding";
const TASKS_KEY = "instead.tasks";
const UNLOCK_KEY = "instead.unlock";
const BLOCKED_APPS_KEY = "instead.blockedApps";
const DRAWINGS_INDEX_KEY = "instead.drawings.index";
const drawingKey = (date: string) => `instead.drawing.${date}`;

// One saved drawing per calendar day (today's session overwrites itself
// if you keep adding to it) — this is also the foundation for a future
// day-by-day drawing course: each day's canvas persists on its own.
export async function saveDrawing(strokes: DrawStroke[]): Promise<void> {
  if (strokes.length === 0) return;
  const date = new Date().toISOString().slice(0, 10);
  const entry: SavedDrawing = { date, strokes, savedAt: new Date().toISOString() };
  await AsyncStorage.setItem(drawingKey(date), JSON.stringify(entry));

  const rawIndex = await AsyncStorage.getItem(DRAWINGS_INDEX_KEY);
  const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
  if (!index.includes(date)) {
    index.push(date);
    await AsyncStorage.setItem(DRAWINGS_INDEX_KEY, JSON.stringify(index));
  }
}

export async function loadDrawing(date: string): Promise<SavedDrawing | null> {
  const raw = await AsyncStorage.getItem(drawingKey(date));
  return raw ? JSON.parse(raw) : null;
}

export async function listDrawingDates(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(DRAWINGS_INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveBlockedApps(apps: BlockedApp[]): Promise<void> {
  await AsyncStorage.setItem(BLOCKED_APPS_KEY, JSON.stringify(apps));
  syncBlockedPackages(apps.map((a) => a.packageName));
}

export async function loadBlockedApps(): Promise<BlockedApp[]> {
  const raw = await AsyncStorage.getItem(BLOCKED_APPS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveOnboarding(data: OnboardingData): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
}

export async function loadOnboarding(): Promise<OnboardingData | null> {
  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function getCompletedTasks(): Promise<CompletedTask[]> {
  const raw = await AsyncStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getTodayEarnedMinutes(): Promise<number> {
  const tasks = await getCompletedTasks();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return tasks
    .filter((t) => new Date(t.completedAt) >= startOfDay)
    .reduce((sum, t) => sum + t.rewardMinutes, 0);
}

// How many times a task type has been completed today, and when the most
// recent one was — the basis for daily-use caps and cooldowns (currently
// only enforced for "draw", the easiest task to spam for free unlock time).
export async function getTaskUsageToday(
  type: TaskType
): Promise<{ count: number; lastCompletedAt: string | null }> {
  const tasks = await getCompletedTasks();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todays = tasks.filter((t) => t.type === type && new Date(t.completedAt) >= startOfDay);
  return {
    count: todays.length,
    lastCompletedAt: todays.length > 0 ? todays[todays.length - 1].completedAt : null,
  };
}

export interface DrawAvailability {
  available: boolean;
  reason?: "daily_limit" | "cooldown";
  usesLeft: number;
  cooldownRemainingMinutes: number;
}

export async function getDrawAvailability(): Promise<DrawAvailability> {
  const { count, lastCompletedAt } = await getTaskUsageToday("draw");
  const usesLeft = Math.max(0, DRAW_MAX_USES_PER_DAY - count);

  if (usesLeft === 0) {
    return { available: false, reason: "daily_limit", usesLeft: 0, cooldownRemainingMinutes: 0 };
  }

  if (lastCompletedAt) {
    const msSinceLast = Date.now() - new Date(lastCompletedAt).getTime();
    const cooldownMs = DRAW_COOLDOWN_MINUTES * 60_000;
    if (msSinceLast < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - msSinceLast) / 60_000);
      return { available: false, reason: "cooldown", usesLeft, cooldownRemainingMinutes: remainingMinutes };
    }
  }

  return { available: true, usesLeft, cooldownRemainingMinutes: 0 };
}

export async function getActiveUnlock(): Promise<UnlockSession | null> {
  const raw = await AsyncStorage.getItem(UNLOCK_KEY);
  if (!raw) return null;
  const session: UnlockSession = JSON.parse(raw);
  return new Date(session.expiresAt) > new Date() ? session : null;
}

// Records a completed task and extends the current unlock window by its
// reward minutes (stacking on top of any time-remaining, not replacing it).
export async function completeTask(task: CompletedTask): Promise<UnlockSession> {
  const tasks = await getCompletedTasks();
  tasks.push(task);
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  const existing = await getActiveUnlock();
  const base = existing ? new Date(existing.expiresAt) : new Date();
  const expiresAt = new Date(base.getTime() + task.rewardMinutes * 60_000);
  const session: UnlockSession = {
    unlockedAt: existing?.unlockedAt ?? new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  await AsyncStorage.setItem(UNLOCK_KEY, JSON.stringify(session));
  syncUnlockExpiresAt(expiresAt.getTime());
  return session;
}
