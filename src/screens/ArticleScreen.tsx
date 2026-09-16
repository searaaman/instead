import { useMemo, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../lib/theme";
import { completeTask } from "../lib/storage";
import { ARTICLE_REWARD_MINUTES, ARTICLES } from "../lib/tasks";

type Props = NativeStackScreenProps<RootStackParamList, "Article">;

export default function ArticleScreen({ navigation }: Props) {
  const article = useMemo(() => ARTICLES[Math.floor(Math.random() * ARTICLES.length)], []);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const answeredCorrectly = selected === article.correctIndex;

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 24) {
      setReachedEnd(true);
    }
  }

  async function handleClaim() {
    setSaving(true);
    await completeTask({
      id: `article-${Date.now()}`,
      type: "article",
      completedAt: new Date().toISOString(),
      rewardMinutes: ARTICLE_REWARD_MINUTES,
      label: article.title,
    });
    navigation.replace("TaskComplete", { minutes: ARTICLE_REWARD_MINUTES, label: article.title });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={200}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>&larr; Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.body}>{article.body}</Text>

      {!reachedEnd && <Text style={styles.hint}>Keep scrolling to the end…</Text>}

      {reachedEnd && (
        <View style={styles.quiz}>
          <Text style={styles.question}>{article.question}</Text>
          {article.options.map((option, i) => {
            const showState = selected !== null;
            const isCorrect = i === article.correctIndex;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  showState && isCorrect && styles.optionCorrect,
                  showState && selected === i && !isCorrect && styles.optionWrong,
                ]}
                onPress={() => setSelected(i)}
                disabled={selected !== null}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}

          {selected !== null && !answeredCorrectly && (
            <TouchableOpacity style={styles.retryButton} onPress={() => setSelected(null)}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          )}

          {answeredCorrectly && (
            <TouchableOpacity style={styles.button} onPress={handleClaim} disabled={saving}>
              <Text style={styles.buttonText}>
                {saving ? "Claiming…" : `Claim +${ARTICLE_REWARD_MINUTES} min`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 60,
    gap: 10,
  },
  back: {
    color: colors.welcomeStrong,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },
  quiz: {
    marginTop: 16,
    gap: 10,
  },
  question: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  optionCorrect: {
    backgroundColor: colors.hopeSoft,
    borderColor: colors.hope,
  },
  optionWrong: {
    backgroundColor: colors.welcomeSoft,
    borderColor: colors.welcome,
  },
  optionText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  retryText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 8,
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.hope,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
