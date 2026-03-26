import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Storage key ─────────────────────────────────────────────────────────────

const THEME_KEY = "habit-guard:theme-override";

// ─── Types ───────────────────────────────────────────────────────────────────

// null means "follow the system", "light"/"dark" means manually overridden
type ThemeOverride = "light" | "dark" | null;

type ThemeContextValue = Readonly<{
  isDark: boolean;
  override: ThemeOverride;
  // Call with "light" or "dark" to pin the theme, or null to follow system
  setOverride: (value: ThemeOverride) => void;
}>;

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  override: null,
  setOverride: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const systemScheme = useColorScheme();
  const [override, setOverrideState] = useState<ThemeOverride>(null);
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark") {
          setOverrideState(stored);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const setOverride = useCallback((value: ThemeOverride) => {
    setOverrideState(value);
    if (value === null) {
      AsyncStorage.removeItem(THEME_KEY);
    } else {
      AsyncStorage.setItem(THEME_KEY, value);
    }
  }, []);

  // Resolve the actual theme: override wins, falls back to system
  const isDark = override !== null
    ? override === "dark"
    : systemScheme === "dark";

  // Don't render children until we've loaded the stored preference —
  // prevents a flash from system theme → stored theme on startup
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, override, setOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

// Use this everywhere instead of useColorScheme()
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}