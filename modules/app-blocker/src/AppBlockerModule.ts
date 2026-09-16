import { NativeModule, requireNativeModule } from 'expo';

declare class AppBlockerModule extends NativeModule<{}> {
  isAccessibilityServiceEnabled(): boolean;
  openAccessibilitySettings(): void;
  setBlockedPackages(packages: string[]): void;
  setUnlockExpiresAt(expiresAtMillis: number): void;
  consumeSettingsInterceptPending(): boolean;
  suppressSettingsInterceptFor(durationMillis: number): void;
}

export default requireNativeModule<AppBlockerModule>('AppBlocker');
