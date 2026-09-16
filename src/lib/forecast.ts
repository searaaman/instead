// The onboarding forecast reveal happens before we know anything about
// the user's real habits (no app picked, no usage data yet), so it uses
// this illustrative commitment rather than a self-reported number tied
// to one named app.
export const ILLUSTRATIVE_DAILY_MINUTES = 10;

export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

// Simple v1: what N minutes/day become over `days`. A later version
// swaps this for an LLM call that turns the raw hours into a concrete,
// goal-specific milestone (e.g. "enough to learn 3 songs").
export function forecastHoursOverDays(minutesPerDay: number, days: number): number {
  return minutesToHours(minutesPerDay * days);
}
