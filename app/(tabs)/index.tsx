import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TasksTab from "./tasks";
import BadgesTab from "./badges";
import ProfileTab from "./profile";

import {
  Task,
  Trophy,
  Friend,
  INITIAL_TASKS,
  INITIAL_TROPHIES,
  INITIAL_FRIENDS,
  getColors,
} from "./types";

type Tab = "Tasks" | "Badges" | "Profile";

const TAB_ICONS: Record<Tab, string> = {
  Tasks: "📋",
  Badges: "🏆",
  Profile: "👤",
};

export default function App() {
  const colorScheme = useColorScheme();
  const C = getColors(colorScheme === "dark");
  const insets = useSafeAreaInsets();

  // ── All shared state lives here so switching tabs never resets anything ──
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [trophies] = useState<Trophy[]>(INITIAL_TROPHIES);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [activeTab, setActiveTab] = useState<Tab>("Tasks");

  return (
    // We use a plain View instead of SafeAreaView so we can control exactly
    // which edges get padding. paddingTop comes from insets so the content
    // sits below the status bar. The background color fills the status bar
    // area and the home indicator area so there are no mismatched strips.
    <View style={[s.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>

      {/*
        All three tabs are mounted at once (display: none when inactive).
        This preserves scroll position, filter state, and task state
        across tab switches — no resets when navigating back.
      */}
      <View style={[s.tab, activeTab === "Tasks" ? s.visible : s.hidden]}>
        <TasksTab tasks={tasks} setTasks={setTasks} />
      </View>

      <View style={[s.tab, activeTab === "Badges" ? s.visible : s.hidden]}>
        <BadgesTab trophies={trophies} />
      </View>

      <View style={[s.tab, activeTab === "Profile" ? s.visible : s.hidden]}>
        <ProfileTab friends={friends} setFriends={setFriends} />
      </View>

      {/* Bottom Tab Bar — paddingBottom pushes content above the home indicator */}
      <View
        style={[
          s.tabBar,
          {
            backgroundColor: C.card,
            borderTopColor: C.border,
            // insets.bottom is the home indicator height on iPhone (typically 34pt).
            // On devices with no home indicator insets.bottom is 0 so we fall back to 8pt.
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          },
        ]}
      >
        {(["Tasks", "Badges", "Profile"] as Tab[]).map((tab) => {
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
              <Text style={[s.tabIcon, active && s.tabIconActive]}>
                {TAB_ICONS[tab]}
              </Text>
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

  // Each tab fills all available space; hidden ones collapse via display:none
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
  tabIcon: { fontSize: 22, marginBottom: 2, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, fontWeight: "500" },
});
