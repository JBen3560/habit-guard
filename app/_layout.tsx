import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/src/context/AuthContext";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { TimeFormatProvider } from "@/src/context/TimeFormatContext";

// Root app layout that applies global providers and navigation shell.

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
<<<<<<< HEAD
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
=======
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TimeFormatProvider>
            <AppShell />
          </TimeFormatProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
>>>>>>> 8a27bf494b447b256fbf4eb173557edba45894e4
  );
}
