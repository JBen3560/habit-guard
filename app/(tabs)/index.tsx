import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useTheme } from "@/src/context/ThemeContext";
import {
  type Friend,
  INITIAL_FRIENDS,
  INITIAL_TROPHIES,
  type Task,
  type Trophy,
  getColors,
} from "@/src/types";
import { INITIAL_TASKS } from "@/src/mockData";

import AchievementsTab from "./achievements";
import ProfileTab from "./profile";
import HabitsTab from "./habits";


type Tab = "Habits" | "Achievements" | "Profile";

const TAB_ICONS: Record<Tab, React.ComponentProps<typeof MaterialIcons>["name"]> = {
  Habits:       "today",
  Achievements: "emoji-events",
  Profile:      "person",
};

export default function App() {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const insets = useSafeAreaInsets();

  // Save current state
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [trophies] = useState<Trophy[]>(INITIAL_TROPHIES);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [activeTab, setActiveTab] = useState<Tab>("Habits");

  return (

    <View style={[s.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>

      <View style={[s.tab, activeTab === "Habits" ? s.visible : s.hidden]}>
        <HabitsTab tasks={tasks} setTasks={setTasks} />
      </View>

      <View style={[s.tab, activeTab === "Achievements" ? s.visible : s.hidden]}>
        <AchievementsTab trophies={trophies} />
      </View>

      <View style={[s.tab, activeTab === "Profile" ? s.visible : s.hidden]}>
        <ProfileTab friends={friends} setFriends={setFriends} />
      </View>

      {/* Bottom Tab Bar */}
      <View
        style={[
          s.tabBar,
          {
            backgroundColor: C.card,
            borderTopColor: C.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          },
        ]}
      >
        {(["Habits", "Achievements", "Profile"] as Tab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={s.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              {active && (
                <View style={[s.tabIndicator, { backgroundColor: C.blue }]} />
              )}
              <MaterialIcons
                name={TAB_ICONS[tab]}
                size={24}
                color={active ? C.blue : C.sub}
              />
              <Text
                style={[
                  s.tabLabel,
                  { color: C.sub },
                  active && { color: C.blue, fontWeight: "700" },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  // Each tab fills all available space
  tab: { flex: 1 },
  visible: { display: "flex" },
  hidden: { display: "none" },

  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
    paddingTop: 4,
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: { fontSize: 11, fontWeight: "500" },
});
