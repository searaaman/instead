// Rebuilt palette + type system (v2). The old version leaned on a warm
// cream background + terracotta accent + system fonts — comfortable, but
// close to the exact "safe AI default" look (warm neutral + one earthy
// accent, no real typographic identity). This version is built around
// the mascot instead: Sprout is a small green plant, so green is the
// actual hero/brand color here (also well-supported by color psychology
// research for wellness/habit apps — green reads as growth), not just
// one of several similarly-weighted accents.
//
//   primary  -> the hero color: growth, unlocked, primary actions, Sprout
//   welcome  -> warmth/comfort/reward — onboarding, celebration moments
//   info     -> neutral, factual readouts (today's usage) — not good, not bad
export const colors = {
  background: "#F3F8F4",
  surface: "#FFFFFF",
  surfaceAlt: "#E9F0EA",
  border: "#DCE7DD",

  textPrimary: "#1C2620",
  textSecondary: "#67766C",

  primary: "#2FA65D",
  primarySoft: "#DFF3E6",
  primaryStrong: "#1F7A44",

  welcome: "#F2A93B",
  welcomeSoft: "#FDF0D8",
  welcomeStrong: "#B8781E",
  welcomeText: "#2A1E08",

  info: "#5B6EE8",
  infoSoft: "#E8EAFC",

  // Deprecated aliases kept only so older screens using these names still
  // resolve correctly — new code should use `primary`/`info` directly.
  hope: "#2FA65D",
  hopeSoft: "#DFF3E6",
  today: "#5B6EE8",
  todaySoft: "#E8EAFC",
};

// Baloo 2 (rounded, friendly, strong at large sizes — carries the
// mascot-led personality) for headings; Nunito (warm, rounded terminals,
// but calm at small sizes) for body copy. Neither is the "Inter/system
// default" a generic AI pass reaches for.
export const fonts = {
  headingExtraBold: "Baloo2_800ExtraBold",
  headingBold: "Baloo2_700Bold",
  headingSemiBold: "Baloo2_600SemiBold",
  headingMedium: "Baloo2_500Medium",
  body: "Nunito_400Regular",
  bodySemiBold: "Nunito_600SemiBold",
  bodyBold: "Nunito_700Bold",
  bodyExtraBold: "Nunito_800ExtraBold",
};
