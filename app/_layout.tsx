import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";

// Light and dark background colors — must match C.bg in types.ts
const BG_LIGHT = "#F9FAFB";
const BG_DARK = "#111827";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Sets the native system background color (the area behind the app) as early
  // as possible — this is what prevents the black bars on initial load in dark
  // mode before React has finished mounting.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(isDark ? BG_DARK : BG_LIGHT);
  }, [isDark]);

  return (
    <SafeAreaProvider>
      {/* style="light" = dark icons (for light bg), style="dark" = white icons (for dark bg) */}
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
