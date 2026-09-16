package expo.modules.appblocker

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

// Watches for foreground-app changes system-wide. When the app that just
// came to the front is on the blocked list and there's no active unlock
// session, it bounces the user back to our own app instead — same
// mechanism real screen-time blockers use, just with a task-based unlock
// instead of a hard block.
//
// It also watches for one more thing: navigation toward Android's
// Accessibility settings screen — the one place the user could turn this
// whole service off. There's no way to stop that (any accessibility
// service can be disabled by its owner; that's Android's design, not a
// bug here), but this service is still alive right up until the toggle
// is actually flipped, so it can intercept the *approach* and show a
// deliberate warning first instead of letting it happen silently.
class AppBlockerAccessibilityService : AccessibilityService() {
  private var lastRedirectedPackage: String? = null
  private var lastRedirectedAt: Long = 0
  private var lastSettingsInterceptAt: Long = 0

  override fun onAccessibilityEvent(event: AccessibilityEvent) {
    if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val packageName = event.packageName?.toString() ?: return
    if (packageName == applicationContext.packageName) return

    val prefs = applicationContext.getSharedPreferences(
      AppBlockerModule.PREFS_NAME,
      Context.MODE_PRIVATE
    )

    if (packageName == SETTINGS_PACKAGE) {
      maybeInterceptSettingsNavigation(event, prefs)
      return
    }

    val blocked = prefs.getStringSet(AppBlockerModule.KEY_BLOCKED, emptySet()) ?: emptySet()
    if (packageName !in blocked) return

    val expiresAt = prefs.getLong(AppBlockerModule.KEY_EXPIRES, 0L)
    if (System.currentTimeMillis() < expiresAt) return // currently unlocked — let it through

    // Debounce: a single app switch can fire several window-state-changed
    // events in quick succession, which would otherwise relaunch our app
    // repeatedly on top of itself.
    val now = System.currentTimeMillis()
    if (packageName == lastRedirectedPackage && now - lastRedirectedAt < 1500) return
    lastRedirectedPackage = packageName
    lastRedirectedAt = now

    relaunchOwnApp()
  }

  private fun maybeInterceptSettingsNavigation(
    event: AccessibilityEvent,
    prefs: android.content.SharedPreferences
  ) {
    // Deliberately narrow: only the Accessibility section of Settings,
    // identified by its screen class name, not "Settings" as a whole.
    // Intercepting all of Settings would yank the user back here every
    // time they check Wi-Fi or brightness — exactly the kind of
    // over-broad, spyware-like behavior this app is trying not to be.
    val className = event.className?.toString() ?: return
    if (!className.contains("Accessibility", ignoreCase = true)) return

    val suppressedUntil = prefs.getLong(AppBlockerModule.KEY_SETTINGS_SUPPRESSED_UNTIL, 0L)
    if (System.currentTimeMillis() < suppressedUntil) return // user already confirmed, let it through

    val now = System.currentTimeMillis()
    if (now - lastSettingsInterceptAt < 1500) return
    lastSettingsInterceptAt = now

    prefs.edit().putBoolean(AppBlockerModule.KEY_SETTINGS_INTERCEPT_PENDING, true).apply()
    relaunchOwnApp()
  }

  private fun relaunchOwnApp() {
    val launchIntent = applicationContext.packageManager
      .getLaunchIntentForPackage(applicationContext.packageName) ?: return
    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    applicationContext.startActivity(launchIntent)
  }

  override fun onInterrupt() {}

  companion object {
    private const val SETTINGS_PACKAGE = "com.android.settings"
  }
}
