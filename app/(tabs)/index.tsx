import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";

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
  C,
} from "./types";

type Tab = "Tasks" | "Badges" | "Profile";

const TAB_ICONS: Record<Tab, string> = {
  Tasks: "📋",
  Badges: "🏆",
  Profile: "👤",
};

export default function App() {
  // ── All shared state lives here so switching tabs never resets anything ──
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [trophies] = useState<Trophy[]>(INITIAL_TROPHIES);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);

  const [activeTab, setActiveTab] = useState<Tab>("Tasks");

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

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

      {/* Bottom Tab Bar */}
      <View style={s.tabBar}>
        {(["Tasks", "Badges", "Profile"] as Tab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={s.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              {active && <View style={s.tabIndicator} />}
              <Text style={[s.tabIcon, active && s.tabIconActive]}>
                {TAB_ICONS[tab]}
              </Text>
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Each tab fills all available space; hidden ones collapse via display:none
  tab: { flex: 1 },
  visible: { display: "flex" },
  hidden: { display: "none" },

  tabBar: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
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
    backgroundColor: C.blue,
    borderRadius: 2,
  },
  tabIcon: { fontSize: 22, marginBottom: 2, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: C.sub, fontWeight: "500" },
  tabLabelActive: { color: C.blue, fontWeight: "700" },
});
