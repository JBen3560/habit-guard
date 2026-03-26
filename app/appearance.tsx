import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";
import { getColors } from "@/src/types/index";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type ThemeOption = {
  label: string;
  description: string;
  value: "light" | "dark" | null;
  icon: string;
};

const OPTIONS: ThemeOption[] = [
  {
    icon: "📱",
    label: "System Default",
    description: "Follows your device's light/dark setting",
    value: null,
  },
  {
    icon: "☀️",
    label: "Light",
    description: "Always use the light theme",
    value: "light",
  },
  {
    icon: "🌙",
    label: "Dark",
    description: "Always use the dark theme",
    value: "dark",
  },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { isDark, override, setOverride } = useTheme();
  const C = getColors(isDark);

  // The currently active option matches override, or null for system default
  const activeValue = override;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={[s.backText, { color: C.blue }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.text }]}>Appearance</Text>
        {/* Spacer to centre the title */}
        <View style={s.backBtn} />
      </View>

      {/* Options */}
      <View style={s.section}>
        <Text style={[s.sectionLabel, { color: C.sub }]}>THEME</Text>

        {OPTIONS.map((opt, index) => {
          const isActive = activeValue === opt.value;
          const isLast = index === OPTIONS.length - 1;

          return (
            <TouchableOpacity
              key={opt.label}
              style={[
                s.row,
                { backgroundColor: C.card, borderBottomColor: C.border },
                index === 0 && s.rowFirst,
                isLast && s.rowLast,
              ]}
              onPress={() => setOverride(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={s.rowIcon}>{opt.icon}</Text>
              <View style={s.rowText}>
                <Text style={[s.rowLabel, { color: C.text }]}>{opt.label}</Text>
                <Text style={[s.rowDesc, { color: C.sub }]}>{opt.description}</Text>
              </View>
              {/* Checkmark on the active option */}
              {isActive && (
                <Text style={[s.check, { color: C.blue }]}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 70 },
  backText: { fontSize: 17 },
  title: { fontSize: 17, fontWeight: "700" },
  section: { marginTop: 32, marginHorizontal: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  rowFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  rowLast: { borderBottomWidth: 0, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  rowIcon: { fontSize: 22, marginRight: 14 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  rowDesc: { fontSize: 12 },
  check: { fontSize: 18, fontWeight: "700" },
});