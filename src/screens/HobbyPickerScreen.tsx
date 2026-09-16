import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, fonts } from "../lib/theme";
import { getDrawAvailability, type DrawAvailability } from "../lib/storage";
import {
  ARTICLE_REWARD_MINUTES,
  DRAW_REWARD_PER_MINUTE,
  JOURNAL_REWARD_MINUTES,
  LANGUAGE_REWARD_MINUTES,
} from "../lib/tasks";
import { SproutTip } from "../components/Sprout";

type Props = NativeStackScreenProps<RootStackParamList, "HobbyPicker">;

const STATIC_ACTIVITIES: {
  route: "Journal" | "LanguageQuiz" | "Article";
  emoji: string;
  title: string;
  body: string;
  minutes: number;
}[] = [
  { route: "LanguageQuiz", emoji: "🔤", title: "Learn a language", body: "A quick Spanish vocab quiz — pass 3 of 5. Fastest to finish.", minutes: LANGUAGE_REWARD_MINUTES },
  { route: "Article", emoji: "📰", title: "Read an article", body: "A short read, then one question to prove it.", minutes: ARTICLE_REWARD_MINUTES },
  { route: "Journal", emoji: "📓", title: "Journal", body: "A prompt and a page. Pasting is off, so it's actually yours.", minutes: JOURNAL_REWARD_MINUTES },
];

export default function HobbyPickerScreen({ navigation }: Props) {
  const [drawAvailability, setDrawAvailability] = useState<DrawAvailability | null>(null);

  useFocusEffect(
    useCallback(() => {
      getDrawAvailability().then(setDrawAvailability);
    }, [])
  );

  const drawDisabled = !!drawAvailability && !drawAvailability.available;
  const drawSubtext = !drawAvailability
    ? "…"
    : drawAvailability.reason === "daily_limit"
      ? "Used up for today — more tomorrow"
      : drawAvailability.reason === "cooldown"
        ? `Available again in ${drawAvailability.cooldownRemainingMinutes} min`
        : `A guided shape to sketch — ${drawAvailability.usesLeft} left today`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>&larr; Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Small habits</Text>

      <SproutTip
        mood="calm"
        text="Not sure which one? The language quiz is quickest, and it's actually graded — good place to start."
      />

      <View style={styles.list}>
        {STATIC_ACTIVITIES.map((activity) => (
          <TouchableOpacity
            key={activity.route}
            style={styles.card}
            onPress={() => navigation.navigate(activity.route)}
          >
            <Text style={styles.emoji}>{activity.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{activity.title}</Text>
              <Text style={styles.cardBody}>{activity.body}</Text>
            </View>
            <Text style={styles.reward}>+{activity.minutes}m</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.card, drawDisabled && styles.cardDisabled]}
          onPress={() => navigation.navigate("Draw")}
          disabled={drawDisabled}
        >
          <Text style={styles.emoji}>✏️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Draw</Text>
            <Text style={styles.cardBody}>{drawSubtext} · lowest payout, can't be graded</Text>
          </View>
          <Text style={styles.reward}>{drawDisabled ? "—" : `~${DRAW_REWARD_PER_MINUTE}x`}</Text>
        </TouchableOpacity>
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
    paddingTop: 56,
    paddingBottom: 40,
    gap: 14,
  },
  back: {
    color: colors.welcomeStrong,
    fontFamily: fonts.bodyBold,
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.headingExtraBold,
    fontSize: 26,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 26,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.headingSemiBold,
    fontSize: 15,
  },
  cardBody: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  reward: {
    color: colors.hope,
    fontFamily: fonts.bodyExtraBold,
  },
});
