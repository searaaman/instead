package expo.modules.appblocker

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppBlocker")

    Function("isAccessibilityServiceEnabled") {
      isServiceEnabled()
    }

    Function("openAccessibilitySettings") {
      appContext.reactContext?.let { context ->
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
      }
    }

    // Written to SharedPreferences (not just kept in JS/AsyncStorage) so the
    // AccessibilityService — a separate Android component that reacts to
    // system events, not something driven by the RN JS bridge — can read
    // the current blocklist and unlock state on its own.
    Function("setBlockedPackages") { packages: List<String> ->
      appContext.reactContext?.let { context ->
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putStringSet(KEY_BLOCKED, packages.toSet()).apply()
      }
    }

    Function("setUnlockExpiresAt") { expiresAtMillis: Double ->
      appContext.reactContext?.let { context ->
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putLong(KEY_EXPIRES, expiresAtMillis.toLong()).apply()
      }
    }

    // True (and cleared) the first time this is read after the service
    // intercepted an attempt to navigate into Accessibility settings.
    Function("consumeSettingsInterceptPending") {
      val context = appContext.reactContext
      if (context == null) {
        false
      } else {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val pending = prefs.getBoolean(KEY_SETTINGS_INTERCEPT_PENDING, false)
        if (pending) prefs.edit().putBoolean(KEY_SETTINGS_INTERCEPT_PENDING, false).apply()
        pending
      }
    }

    // Lets a user who explicitly confirmed ("continue to Settings anyway")
    // through the warning actually reach the toggle, instead of being
    // bounced back the instant they land on that screen again.
    Function("suppressSettingsInterceptFor") { durationMillis: Double ->
      appContext.reactContext?.let { context ->
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
          .putLong(KEY_SETTINGS_SUPPRESSED_UNTIL, System.currentTimeMillis() + durationMillis.toLong())
          .apply()
      }
    }
  }

  private fun isServiceEnabled(): Boolean {
    val context = appContext.reactContext ?: return false
    val expectedComponentName = "${context.packageName}/${AppBlockerAccessibilityService::class.java.name}"
    val enabledServicesSetting = Settings.Secure.getString(
      context.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
    ) ?: return false
    val colonSplitter = TextUtils.SimpleStringSplitter(':')
    colonSplitter.setString(enabledServicesSetting)
    while (colonSplitter.hasNext()) {
      if (colonSplitter.next().equals(expectedComponentName, ignoreCase = true)) {
        return true
      }
    }
    return false
  }

  companion object {
    const val PREFS_NAME = "app_blocker_prefs"
    const val KEY_BLOCKED = "blocked_packages"
    const val KEY_EXPIRES = "unlock_expires_at"
    const val KEY_SETTINGS_INTERCEPT_PENDING = "settings_intercept_pending"
    const val KEY_SETTINGS_SUPPRESSED_UNTIL = "settings_intercept_suppressed_until"
  }
}
