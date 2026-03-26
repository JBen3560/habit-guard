import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";

import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";

// Light and dark background colors
const BG_LIGHT = "#F9FAFB";
const BG_DARK  = "#111827";

function AppShell() {
  const { isDark } = useTheme();

  // Sets the native system background color as early as possible
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(isDark ? BG_DARK : BG_LIGHT);
  }, [isDark]);

  return (
    <>
      {/* style="light" = dark icons (for light bg), style="dark" = white icons (for dark bg) */}
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
