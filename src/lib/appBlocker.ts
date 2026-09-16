import { Platform } from "react-native";
import AppBlockerModule from "../../modules/app-blocker/src/AppBlockerModule";

export function isBlockerSupported(): boolean {
  return Platform.OS === "android";
}

export function isAccessibilityServiceEnabled(): boolean {
  if (!isBlockerSupported()) return false;
  try {
    return AppBlockerModule.isAccessibilityServiceEnabled();
  } catch {
    return false;
  }
}

export function openAccessibilitySettings(): void {
  if (!isBlockerSupported()) return;
  AppBlockerModule.openAccessibilitySettings();
}

export function syncBlockedPackages(packages: string[]): void {
  if (!isBlockerSupported()) return;
  AppBlockerModule.setBlockedPackages(packages);
}

export function syncUnlockExpiresAt(expiresAtMillis: number): void {
  if (!isBlockerSupported()) return;
  AppBlockerModule.setUnlockExpiresAt(expiresAtMillis);
}

// True (and clears the flag) if the accessibility service just bounced
// the user back here because they were navigating toward Accessibility
// settings — presumably to turn this off.
export function consumeSettingsInterceptPending(): boolean {
  if (!isBlockerSupported()) return false;
  try {
    return AppBlockerModule.consumeSettingsInterceptPending();
  } catch {
    return false;
  }
}

// Lets a deliberate "continue to Settings anyway" through without being
// immediately bounced back again.
export function suppressSettingsInterceptFor(durationMillis: number): void {
  if (!isBlockerSupported()) return;
  AppBlockerModule.suppressSettingsInterceptFor(durationMillis);
}
