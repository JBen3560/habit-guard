import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Trophy, C } from "./types";

type Props = {
  trophies: Trophy[];
};

const TYPE_COLOR: Record<Trophy["type"], string> = {
  gold: "#F59E0B",
  silver: "#9CA3AF",
  bronze: "#CD7F32",
  bad: "#EF4444",
  streak: "#3B82F6",
};

const TYPE_LABEL: Record<Trophy["type"], string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  bad: "Penalty",
  streak: "Streak",
};

export default function BadgesTab({ trophies }: Props) {
  const [filter, setFilter] = useState<"All" | "Earned" | "Locked">("All");

  const earned = trophies.filter((t) => t.earned);
  const locked = trophies.filter((t) => !t.earned);
  const penalties = trophies.filter((t) => t.type === "bad" && t.earned);
  const filtered =
    filter === "All" ? trophies : filter === "Earned" ? earned : locked;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.dateText}>Your Achievements</Text>
          <Text style={s.titleText}>Trophies & Badges</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsBar}>
        <View style={s.statItem}>
          <Text style={s.statNum}>{trophies.length}</Text>
          <Text style={s.statLabel}>TOTAL</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: C.green }]}>{earned.length}</Text>
          <Text style={s.statLabel}>EARNED</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: C.red }]}>{penalties.length}</Text>
          <Text style={s.statLabel}>PENALTIES</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={s.filterRow}>
        {(["All", "Earned", "Locked"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[s.filterTab, filter === f && s.filterTabActive]}
          >
            <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {filtered.map((trophy) => (
            <View
              key={trophy.id}
              style={[
                s.card,
                !trophy.earned && s.cardLocked,
                trophy.type === "bad" && trophy.earned && s.cardBad,
              ]}
            >
              <Text style={[s.icon, !trophy.earned && { opacity: 0.3 }]}>
                {trophy.icon}
              </Text>
              <View
                style={[
                  s.typeBadge,
                  { backgroundColor: TYPE_COLOR[trophy.type] + "22" },
                ]}
              >
                <Text style={[s.typeText, { color: TYPE_COLOR[trophy.type] }]}>
                  {TYPE_LABEL[trophy.type]}
                </Text>
              </View>
              <Text style={[s.cardTitle, !trophy.earned && s.cardTitleLocked]}>
                {trophy.title}
              </Text>
              <Text style={s.cardDesc}>{trophy.description}</Text>
              {trophy.earned && trophy.earnedDate ? (
                <Text style={s.earnedDate}>Earned {trophy.earnedDate}</Text>
              ) : !trophy.earned ? (
                <Text style={s.lockedText}>🔒 Locked</Text>
              ) : null}
            </View>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  dateText: { fontSize: 12, color: C.sub, fontWeight: "500", marginBottom: 2 },
  titleText: { fontSize: 24, fontWeight: "800", color: C.text },

  statsBar: {
    flexDirection: "row",
    backgroundColor: C.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "800", color: C.text },
  statLabel: { fontSize: 10, color: C.sub, fontWeight: "600", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.border },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterTabActive: { backgroundColor: C.blue, borderColor: C.blue },
  filterTabText: { fontSize: 13, color: C.sub, fontWeight: "600" },
  filterTabTextActive: { color: "#fff" },

  list: { flex: 1, paddingHorizontal: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  card: {
    width: "47%",
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLocked: { backgroundColor: "#F3F4F6", opacity: 0.7 },
  cardBad: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  icon: { fontSize: 40, marginBottom: 8 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeText: { fontSize: 10, fontWeight: "700" },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    marginBottom: 4,
  },
  cardTitleLocked: { color: C.sub },
  cardDesc: { fontSize: 11, color: C.sub, textAlign: "center", marginBottom: 4 },
  earnedDate: { fontSize: 10, color: C.green, fontWeight: "600" },
  lockedText: { fontSize: 10, color: C.sub, marginTop: 4 },
});
