import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const DAYS_DEFAULT_KEY = "habit-guard:days-default";

type DaysDefaultContextValue = Readonly<{
  daysDefault: boolean;
  setDaysDefault: (value: boolean) => void;
}>;

const DaysDefaultContext = createContext<DaysDefaultContextValue>({
  daysDefault: false,
  setDaysDefault: () => {},
});

export function DaysDefaultProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [daysDefault, setDaysDefaultState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DAYS_DEFAULT_KEY)
      .then((stored) => {
        if (stored === "true") setDaysDefaultState(true);
      })
      .finally(() => setLoaded(true));
  }, []);

  const setDaysDefault = useCallback((value: boolean) => {
    setDaysDefaultState(value);
    AsyncStorage.setItem(DAYS_DEFAULT_KEY, String(value));
  }, []);

  if (!loaded) return null;

  return (
    <DaysDefaultContext.Provider value={{ daysDefault, setDaysDefault }}>
      {children}
    </DaysDefaultContext.Provider>
  );
}

export function useDaysDefault(): DaysDefaultContextValue {
  return useContext(DaysDefaultContext);
}
