import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import ForecastRevealScreen from "./src/screens/ForecastRevealScreen";
import TrustExplainerScreen from "./src/screens/TrustExplainerScreen";
import GrantAccessScreen from "./src/screens/GrantAccessScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import TaskMenuScreen from "./src/screens/TaskMenuScreen";
import TimedFocusScreen from "./src/screens/TimedFocusScreen";
import HobbyPickerScreen from "./src/screens/HobbyPickerScreen";
import CodeChallengeScreen from "./src/screens/CodeChallengeScreen";
import DrawScreen from "./src/screens/DrawScreen";
import JournalScreen from "./src/screens/JournalScreen";
import LanguageQuizScreen from "./src/screens/LanguageQuizScreen";
import ArticleScreen from "./src/screens/ArticleScreen";
import SelectAppsScreen from "./src/screens/SelectAppsScreen";
import KeepProtectionScreen from "./src/screens/KeepProtectionScreen";
import TaskCompleteScreen from "./src/screens/TaskCompleteScreen";
import SudokuScreen from "./src/screens/SudokuScreen";
import { loadBlockedApps, loadOnboarding } from "./src/lib/storage";
import { colors } from "./src/lib/theme";

export type RootStackParamList = {
  Onboarding: undefined;
  ForecastReveal: undefined;
  TrustExplainer: undefined;
  SelectApps: { fromOnboarding?: boolean } | undefined;
  GrantAccess: undefined;
  Dashboard: undefined;
  KeepProtection: undefined;
  TaskMenu: undefined;
  TaskComplete: { minutes: number; label?: string };
  TimedFocus: { minutes: number; label?: string; instructions?: string };
  HobbyPicker: undefined;
  CodeChallenge: { problemId: string };
  Sudoku: { puzzleId: string };
  Draw: undefined;
  Journal: undefined;
  LanguageQuiz: undefined;
  Article: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [fontsLoaded] = useFonts({
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    Promise.all([loadOnboarding(), loadBlockedApps()]).then(([onboarding, blockedApps]) => {
      if (!onboarding) setInitialRoute("Onboarding");
      else if (blockedApps.length === 0) setInitialRoute("SelectApps");
      else setInitialRoute("Dashboard");
    });
  }, []);

  if (!initialRoute || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.welcome} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="ForecastReveal" component={ForecastRevealScreen} />
        <Stack.Screen name="TrustExplainer" component={TrustExplainerScreen} />
        <Stack.Screen
          name="SelectApps"
          component={SelectAppsScreen}
          initialParams={{ fromOnboarding: true }}
        />
        <Stack.Screen name="GrantAccess" component={GrantAccessScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="KeepProtection" component={KeepProtectionScreen} />
        <Stack.Screen name="TaskMenu" component={TaskMenuScreen} />
        <Stack.Screen name="TaskComplete" component={TaskCompleteScreen} />
        <Stack.Screen name="TimedFocus" component={TimedFocusScreen} />
        <Stack.Screen name="HobbyPicker" component={HobbyPickerScreen} />
        <Stack.Screen name="CodeChallenge" component={CodeChallengeScreen} />
        <Stack.Screen name="Sudoku" component={SudokuScreen} />
        <Stack.Screen name="Draw" component={DrawScreen} />
        <Stack.Screen name="Journal" component={JournalScreen} />
        <Stack.Screen name="LanguageQuiz" component={LanguageQuizScreen} />
        <Stack.Screen name="Article" component={ArticleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
