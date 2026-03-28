import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

// Storage key

const THEME_KEY = "habit-guard:theme-override";

//  Types 

// null means "follow the system", "light"/"dark" means manually overridden
type ThemeOverride = "light" | "dark" | null;

type ThemeContextValue = Readonly<{
  isDark: boolean;
  override: ThemeOverride;
  setOverride: (value: ThemeOverride) => void;
}>;

// Context

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  override: null,
  setOverride: () => {},
});

// Provider

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

  const isDark = override !== null
    ? override === "dark"
    : systemScheme === "dark";

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, override, setOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook 

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
