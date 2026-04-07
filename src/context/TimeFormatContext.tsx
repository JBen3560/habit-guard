import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Storage key

const TIME_FORMAT_KEY = "habit-guard:time-format-override";

// Types

// null means "follow the system", true/false means manually overridden
type TimeFormatOverride = boolean | null;

type TimeFormatContextValue = Readonly<{
  is24Hour: boolean;
  override: TimeFormatOverride;
  setOverride: (value: TimeFormatOverride) => void;
  formatTime: (hhmm: string) => string;
}>;

// Detect system 12/24hr preference by checking if a formatted time contains AM/PM
function detectSystem24Hour(): boolean {
  return !new Date().toLocaleTimeString().match(/AM|PM/i);
}

// Context

const TimeFormatContext = createContext<TimeFormatContextValue>({
  is24Hour: detectSystem24Hour(),
  override: null,
  setOverride: () => {},
  formatTime: (hhmm) => hhmm,
});

// Provider

export function TimeFormatProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [override, setOverrideState] = useState<TimeFormatOverride>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TIME_FORMAT_KEY)
      .then((stored) => {
        if (stored === "true" || stored === "false") {
          setOverrideState(stored === "true");
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const setOverride = useCallback((value: TimeFormatOverride) => {
    setOverrideState(value);
    if (value === null) {
      AsyncStorage.removeItem(TIME_FORMAT_KEY);
    } else {
      AsyncStorage.setItem(TIME_FORMAT_KEY, String(value));
    }
  }, []);

  const is24Hour = override !== null ? override : detectSystem24Hour();

  // Converts a stored "HH:MM" string to the display format
  const formatTime = useCallback(
    (hhmm: string): string => {
      const match = hhmm.match(/^(\d{2}):(\d{2})$/);
      if (!match) return hhmm;
      const hours = parseInt(match[1], 10);
      const minutes = match[2];
      if (is24Hour) return hhmm;
      const period = hours >= 12 ? "PM" : "AM";
      const display = hours % 12 === 0 ? 12 : hours % 12;
      return `${display}:${minutes} ${period}`;
    },
    [is24Hour],
  );

  if (!loaded) return null;

  return (
    <TimeFormatContext.Provider value={{ is24Hour, override, setOverride, formatTime }}>
      {children}
    </TimeFormatContext.Provider>
  );
}

// Hook

export function useTimeFormat(): TimeFormatContextValue {
  return useContext(TimeFormatContext);
}
