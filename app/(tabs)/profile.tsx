import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { Friend, getColors, genId } from "@/src/types/index";

// ─── Friend Profile Modal ─────────────────────────────────────────────────────

function FriendModal({
  visible,
  friend,
  onClose,
}: Readonly<{
  visible: boolean;
  friend: Friend | null;
  onClose: () => void;
}>) {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  if (!friend) return null;
  const needsNudge = friend.missedDays >= 2;
  const firstName = friend.name.split(" ")[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.modalSafe, { backgroundColor: C.bg }]}>
        <View style={[s.modalHeader, { borderBottomColor: C.border, backgroundColor: C.card }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[s.modalBack, { color: C.sub }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[s.modalTitle, { color: C.text }]}>{friend.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={[s.modalBody, { backgroundColor: C.bg }]}>
          <View style={[s.friendProfileCard, { backgroundColor: C.card }]}>
            <Text style={s.friendProfileAvatar}>{friend.avatar}</Text>
            <Text style={[s.friendProfileName, { color: C.text }]}>{friend.name}</Text>
            <Text style={[s.friendProfileTag, { color: C.blue }]}>{friend.tag}</Text>

            <View style={s.friendStats}>
              <View style={s.friendStat}>
                <Text style={[s.friendStatNum, { color: C.text }]}>{friend.streakDays}</Text>
                <Text style={[s.friendStatLabel, { color: C.sub }]}>Streak Days</Text>
              </View>
              <View style={[s.statDivider, { backgroundColor: C.border }]} />
              <View style={s.friendStat}>
                <Text style={[s.friendStatNum, { color: C.red }]}>{friend.missedDays}</Text>
                <Text style={[s.friendStatLabel, { color: C.sub }]}>Missed Days</Text>
              </View>
              <View style={[s.statDivider, { backgroundColor: C.border }]} />
              <View style={s.friendStat}>
                <Text style={[s.friendStatNum, { color: C.text }]}>{friend.tasks}</Text>
                <Text style={[s.friendStatLabel, { color: C.sub }]}>Active Tasks</Text>
              </View>
            </View>
          </View>

          {needsNudge ? (
            <View style={s.nudgeBox}>
              <Text style={s.nudgeTitle}>⚠️ {firstName} has missed {friend.missedDays} days!</Text>
              <Text style={[s.nudgeSubtitle, { color: C.sub }]}>Send some encouragement</Text>
              <TouchableOpacity
                style={[s.nudgeBtn, { backgroundColor: C.yellow }]}
                onPress={() => Alert.alert("Nudge sent!", `${firstName} has been nudged! 💪`)}
              >
                <Text style={s.nudgeBtnText}>👋 Check In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.nudgeBtn, { backgroundColor: C.green }]}
                onPress={() => Alert.alert("Message sent!", `You sent a motivational message to ${firstName}! 🌟`)}
              >
                <Text style={s.nudgeBtnText}>🌟 Send Motivation</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[s.nudgeBox, s.nudgeBoxGood]}>
              <Text style={[s.nudgeGoodText, { color: C.green }]}>🔥 {firstName} is on a roll!</Text>
              <Text style={{ color: C.sub, marginTop: 4 }}>
                {friend.streakDays}-day streak going strong
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Add Friend Modal ─────────────────────────────────────────────────────────

function AddFriendModal({
  visible,
  onAdd,
  onClose,
}: Readonly<{
  visible: boolean;
  onAdd: (tag: string) => void;
  onClose: () => void;
}>) {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [tag, setTag] = useState("");

  const handleAdd = () => {
    if (tag.trim()) { onAdd(tag.trim()); setTag(""); }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.modalSafe, { backgroundColor: C.bg }]}>
        <View style={[s.modalHeader, { borderBottomColor: C.border, backgroundColor: C.card }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[s.modalBack, { color: C.sub }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[s.modalTitle, { color: C.text }]}>Add Friend</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={[s.modalSave, { color: C.blue }]}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={[s.modalBody, { backgroundColor: C.bg }]}>
          <Text style={[s.fieldLabel, { color: C.sub }]}>
            Friend&apos;s Tag
          </Text>
          <TextInput
            style={[s.textInput, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
            value={tag}
            onChangeText={setTag}
            placeholder="@username"
            placeholderTextColor={C.sub}
            autoFocus
          />
          <Text style={[s.addFriendHint, { color: C.sub }]}>
            Enter your friend&apos;s unique tag to send a friend request.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── ProfileTab ───────────────────────────────────────────────────────────────

type Props = Readonly<{
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
}>;

export default function ProfileTab({ friends, setFriends }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [addFriendVisible, setAddFriendVisible] = useState(false);

  const MY_TAG = "@you_habit";
  const MY_STREAK = 13;
  const MY_TASKS = 5;

  const openFriend = (f: Friend) => { setSelectedFriend(f); setFriendModalVisible(true); };

  const addFriend = (tag: string) => {
    const normalized = tag.startsWith("@") ? tag : `@${tag}`;
    const newFriend: Friend = {
      id: genId(),
      name: normalized.replace("@", ""),
      tag: normalized,
      streakDays: 0,
      missedDays: 0,
      avatar: "🙂",
      tasks: 0,
    };
    setFriends((fs) => [...fs, newFriend]);
    setAddFriendVisible(false);
    Alert.alert("Friend Request Sent!", `Request sent to ${normalized}`);
  };

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Profile */}
        <View style={[s.profileCard, { backgroundColor: C.card }]}>
          <View style={s.profileAvatar}>
            <Text style={{ fontSize: 44 }}>😊</Text>
          </View>
          <Text style={[s.profileName, { color: C.text }]}>You</Text>
          <View style={s.profileTagRow}>
            <Text style={[s.profileTag, { color: C.blue, backgroundColor: C.blue + "18" }]}>{MY_TAG}</Text>
            <TouchableOpacity
              style={[s.shareBtn, { backgroundColor: C.green }]}
              onPress={() => Alert.alert("Share", `Your tag is ${MY_TAG} — share it with friends!`)}
            >
              <Text style={s.shareBtnText}>📤 Share</Text>
            </TouchableOpacity>
          </View>

          <View style={[s.profileStats, { borderTopColor: C.border }]}>
            <View style={s.profileStat}>
              <Text style={[s.profileStatNum, { color: C.text }]}>{MY_STREAK}</Text>
              <Text style={[s.profileStatLabel, { color: C.sub }]}>Best Streak</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.border }]} />
            <View style={s.profileStat}>
              <Text style={[s.profileStatNum, { color: C.text }]}>{MY_TASKS}</Text>
              <Text style={[s.profileStatLabel, { color: C.sub }]}>Tasks</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.border }]} />
            <View style={s.profileStat}>
              <Text style={[s.profileStatNum, { color: C.text }]}>{friends.length}</Text>
              <Text style={[s.profileStatLabel, { color: C.sub }]}>Friends</Text>
            </View>
          </View>
        </View>

        {/* Friends */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: C.text }]}>Friends</Text>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: C.blue, shadowColor: C.blue }]}
            onPress={() => setAddFriendVisible(true)}
          >
            <Text style={s.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {friends.map((friend) => {
          const needsNudge = friend.missedDays >= 2;
          return (
            <TouchableOpacity
              key={friend.id}
              style={[s.friendCard, { backgroundColor: C.card }]}
              onPress={() => openFriend(friend)}
              activeOpacity={0.8}
            >
              <View style={[s.friendAvatar, { backgroundColor: C.border }]}>
                <Text style={{ fontSize: 28 }}>{friend.avatar}</Text>
              </View>
              <View style={s.friendInfo}>
                <Text style={[s.friendName, { color: C.text }]}>{friend.name}</Text>
                <Text style={[s.friendTagText, { color: C.sub }]}>{friend.tag}</Text>
                <View style={s.friendMeta}>
                  <Text style={[s.friendMetaText, { color: C.sub }]}>🔥 {friend.streakDays}-day streak</Text>
                  {needsNudge && (
                    <View style={s.missedBadge}>
                      <Text style={[s.missedText, { color: C.red }]}>⚠️ {friend.missedDays} missed</Text>
                    </View>
                  )}
                </View>
              </View>
              {needsNudge && (
                <TouchableOpacity
                  style={s.nudgeSmallBtn}
                  onPress={() => Alert.alert("Nudge sent!", `${friend.name.split(" ")[0]} has been nudged! 💪`)}
                >
                  <Text style={s.nudgeSmallText}>👋</Text>
                </TouchableOpacity>
              )}
              <Text style={[s.chevron, { color: C.sub }]}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* Settings */}
        <View style={[s.sectionHeader, { marginTop: 8 }]}>
          <Text style={[s.sectionTitle, { color: C.text }]}>Settings</Text>
        </View>

        {[
          { icon: "🔔", label: "Notifications" },
          { icon: "🎨", label: "Appearance" },
          { icon: "🔒", label: "Privacy" },
          { icon: "❓", label: "Help & Support" },
          { icon: "🚪", label: "Sign Out" },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[s.settingsRow, { backgroundColor: C.card }]}
            onPress={() => {
              if (item.label === "Appearance") {
                router.push("/appearance");
              } else {
                Alert.alert(item.label, `${item.label} settings coming soon!`);
              }
            }}
          >
            <Text style={s.settingsIcon}>{item.icon}</Text>
            <Text style={[s.settingsLabel, { color: C.text }]}>{item.label}</Text>
            <Text style={[s.chevron, { color: C.sub }]}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      <FriendModal
        visible={friendModalVisible}
        friend={selectedFriend}
        onClose={() => setFriendModalVisible(false)}
      />
      <AddFriendModal
        visible={addFriendVisible}
        onAdd={addFriend}
        onClose={() => setAddFriendVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  profileCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  profileName: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  profileTagRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  profileTag: { fontSize: 14, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontWeight: "700" },
  shareBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  shareBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  profileStats: {
    flexDirection: "row", width: "100%", justifyContent: "space-around",
    borderTopWidth: 1, paddingTop: 16,
  },
  profileStat: { alignItems: "center" },
  profileStatNum: { fontSize: 22, fontWeight: "800" },
  profileStatLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  statDivider: { width: 1 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  addBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  friendCard: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 10, borderRadius: 16, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  friendAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: "700" },
  friendTagText: { fontSize: 12, marginBottom: 4 },
  friendMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  friendMetaText: { fontSize: 12 },
  missedBadge: { backgroundColor: "#FEF2F2", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  missedText: { fontSize: 11, fontWeight: "700" },
  nudgeSmallBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  nudgeSmallText: { fontSize: 18 },
  chevron: { fontSize: 22 },
  friendProfileCard: {
    borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  friendProfileAvatar: { fontSize: 64, marginBottom: 12 },
  friendProfileName: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  friendProfileTag: { fontSize: 14, marginBottom: 16 },
  friendStats: { flexDirection: "row", gap: 24 },
  friendStat: { alignItems: "center" },
  friendStatNum: { fontSize: 22, fontWeight: "800" },
  friendStatLabel: { fontSize: 11, fontWeight: "600" },
  nudgeBox: {
    backgroundColor: "#FFF7ED", borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#FED7AA",
  },
  nudgeBoxGood: { backgroundColor: "#ECFDF5", borderColor: "#10B981" },
  nudgeTitle: { fontSize: 15, fontWeight: "700", color: "#9A3412", marginBottom: 4 },
  nudgeSubtitle: { fontSize: 13, marginBottom: 12 },
  nudgeBtn: { borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 8 },
  nudgeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  nudgeGoodText: { fontWeight: "700", fontSize: 15 },
  settingsRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 2, padding: 16, borderRadius: 12,
  },
  settingsIcon: { fontSize: 20, marginRight: 14 },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 16, borderBottomWidth: 1,
  },
  modalBack: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: "700" },
  modalSave: { fontSize: 16, fontWeight: "700" },
  modalBody: { flex: 1, padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  textInput: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, marginBottom: 16 },
  addFriendHint: { fontSize: 13, marginTop: 4 },
});