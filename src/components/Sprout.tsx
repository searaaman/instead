import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { colors, fonts } from "../lib/theme";

export type SproutMood = "happy" | "excited" | "calm";

// The app's mascot: a small plant that grows alongside the user's
// habits — a deliberately different shape from the usual "animal
// buddy" (Duolingo's owl, Finch's bird): a sprout ties directly into
// the app's actual pitch (small daily effort compounds into growth),
// not just a generic cute face bolted on. Built as plain SVG shapes
// (circles, ellipses, short curves) so the silhouette stays bold and
// legible from app-icon size up to a full illustration.
export default function Sprout({ size = 80, mood = "happy" }: { size?: number; mood?: SproutMood }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* leaves */}
      <Path d="M50 32 C38 8, 14 10, 10 26 C22 38, 40 38, 50 32 Z" fill={colors.primaryStrong} />
      <Path d="M50 32 C62 8, 86 10, 90 26 C78 38, 60 38, 50 32 Z" fill={colors.primaryStrong} />

      {/* body */}
      <Ellipse cx="50" cy="62" rx="33" ry="31" fill={colors.primary} />
      <Ellipse cx="37" cy="49" rx="9" ry="6.5" fill="#FFFFFF" opacity={0.22} />

      {/* cheeks */}
      <Ellipse cx="30" cy="67" rx="4.5" ry="2.8" fill={colors.welcome} opacity={0.55} />
      <Ellipse cx="70" cy="67" rx="4.5" ry="2.8" fill={colors.welcome} opacity={0.55} />

      {/* eyes */}
      {mood === "calm" ? (
        <>
          <Path d="M34 58 Q39.5 53 45 58" stroke={colors.textPrimary} strokeWidth={3.2} fill="none" strokeLinecap="round" />
          <Path d="M55 58 Q60.5 53 66 58" stroke={colors.textPrimary} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx="39.5" cy="58" r="4.8" fill={colors.textPrimary} />
          <Circle cx="60.5" cy="58" r="4.8" fill={colors.textPrimary} />
          <Circle cx="41.2" cy="56.3" r="1.4" fill="#FFFFFF" />
          <Circle cx="62.2" cy="56.3" r="1.4" fill="#FFFFFF" />
        </>
      )}

      {/* mouth */}
      {mood === "excited" ? (
        <Path d="M38 70 Q50 84 62 70 Q50 78 38 70 Z" fill={colors.textPrimary} />
      ) : mood === "calm" ? (
        <Path d="M41 71 Q50 75.5 59 71" stroke={colors.textPrimary} strokeWidth={2.8} fill="none" strokeLinecap="round" />
      ) : (
        <Path d="M39 69 Q50 80 61 69" stroke={colors.textPrimary} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      )}
    </Svg>
  );
}

// Sprout + a speech bubble, for contextual guidance moments ("here's
// what to do next") without needing a full illustration each time.
export function SproutTip({
  text,
  mood = "happy",
  size = 52,
}: {
  text: string;
  mood?: SproutMood;
  size?: number;
}) {
  return (
    <View style={styles.row}>
      <Sprout size={size} mood={mood} />
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
});
