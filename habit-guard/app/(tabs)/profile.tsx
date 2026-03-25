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
  SafeAreaView,
} from "react-native";
import { Friend, C, genId } from "./types";

// ─── Friend Profile Modal ─────────────────────────────────────────────────────

function FriendModal({
  visible,
  friend,
  onClose,
}: {
  visible: boolean;
  friend: Friend | null;
  onClose: () => void;
}) {
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
      <SafeAreaView style={s.modalSafe}>
        <View style={s.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.modalBack}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={s.modalTitle}>{friend.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={s.modalBody}>
          <View style={s.friendProfileCard}>
            <Text style={s.friendProfileAvatar}>{friend.avatar}</Text>
            <Text style={s.friendProfileName}>{friend.name}</Text>
            <Text style={s.friendProfileTag}>{friend.tag}</Text>

            <View style={s.friendStats}>
              <View style={s.friendStat}>
                <Text style={s.friendStatNum}>{friend.streakDays}</Text>
                <Text style={s.friendStatLabel}>Streak Days</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.friendStat}>
                <Text style={[s.friendStatNum, { color: C.red }]}>
                  {friend.missedDays}
                </Text>
                <Text style={s.friendStatLabel}>Missed Days</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.friendStat}>
                <Text style={s.friendStatNum}>{friend.tasks}</Text>
                <Text style={s.friendStatLabel}>Active Tasks</Text>
              </View>
            </View>
          </View>

          {needsNudge ? (
            <View style={s.nudgeBox}>
              <Text style={s.nudgeTitle}>
                ⚠️ {firstName} has missed {friend.missedDays} days!
              </Text>
              <Text style={s.nudgeSubtitle}>Send some encouragement</Text>
              <TouchableOpacity
                style={s.nudgeBtn}
                onPress={() =>
                  Alert.alert("Nudge sent!", `${firstName} has been nudged! 💪`)
                }
              >
                <Text style={s.nudgeBtnText}>👋 Check In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.nudgeBtn, { backgroundColor: C.green }]}
                onPress={() =>
                  Alert.alert(
                    "Message sent!",
                    `You sent a motivational message to ${firstName}! 🌟`
                  )
                }
              >
                <Text style={s.nudgeBtnText}>🌟 Send Motivation</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[s.nudgeBox, s.nudgeBoxGood]}>
              <Text style={s.nudgeGoodText}>
                🔥 {firstName} is on a roll!
              </Text>
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
}: {
  visible: boolean;
  onAdd: (tag: string) => void;
  onClose: () => void;
}) {
  const [tag, setTag] = useState("");

  const handleAdd = () => {
    if (tag.trim()) {
      onAdd(tag.trim());
      setTag("");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.modalSafe}>
        <View style={s.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.modalBack}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.modalTitle}>Add Friend</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={s.modalSave}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={s.modalBody}>
          <Text style={s.fieldLabel}>Friend's Tag</Text>
          <TextInput
            style={s.textInput}
            value={tag}
            onChangeText={setTag}
            placeholder="@username"
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
          <Text style={s.addFriendHint}>
            Enter your friend's unique tag to send a friend request.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── ProfileTab ───────────────────────────────────────────────────────────────

type Props = {
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
};

export default function ProfileTab({ friends, setFriends }: Props) {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [addFriendVisible, setAddFriendVisible] = useState(false);

  const MY_TAG = "@you_habit";
  const MY_STREAK = 13;
  const MY_TASKS = 5;

  const openFriend = (f: Friend) => {
    setSelectedFriend(f);
    setFriendModalVisible(true);
  };

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
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Profile */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={{ fontSize: 44 }}>😊</Text>
          </View>
          <Text style={s.profileName}>You</Text>
          <View style={s.profileTagRow}>
            <Text style={s.profileTag}>{MY_TAG}</Text>
            <TouchableOpacity
              style={s.shareBtn}
              onPress={() =>
                Alert.alert(
                  "Share",
                  `Your tag is ${MY_TAG} — share it with friends!`
                )
              }
            >
              <Text style={s.shareBtnText}>📤 Share</Text>
            </TouchableOpacity>
          </View>

          <View style={s.profileStats}>
            <View style={s.profileStat}>
              <Text style={s.profileStatNum}>{MY_STREAK}</Text>
              <Text style={s.profileStatLabel}>Best Streak</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.profileStat}>
              <Text style={s.profileStatNum}>{MY_TASKS}</Text>
              <Text style={s.profileStatLabel}>Tasks</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.profileStat}>
              <Text style={s.profileStatNum}>{friends.length}</Text>
              <Text style={s.profileStatLabel}>Friends</Text>
            </View>
          </View>
        </View>

        {/* Friends */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Friends</Text>
          <TouchableOpacity
            style={s.addBtn}
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
              style={s.friendCard}
              onPress={() => openFriend(friend)}
              activeOpacity={0.8}
            >
              <View style={s.friendAvatar}>
                <Text style={{ fontSize: 28 }}>{friend.avatar}</Text>
              </View>
              <View style={s.friendInfo}>
                <Text style={s.friendName}>{friend.name}</Text>
                <Text style={s.friendTagText}>{friend.tag}</Text>
                <View style={s.friendMeta}>
                  <Text style={s.friendMetaText}>
                    🔥 {friend.streakDays}-day streak
                  </Text>
                  {needsNudge && (
                    <View style={s.missedBadge}>
                      <Text style={s.missedText}>
                        ⚠️ {friend.missedDays} missed
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {needsNudge && (
                <TouchableOpacity
                  style={s.nudgeSmallBtn}
                  onPress={() =>
                    Alert.alert(
                      "Nudge sent!",
                      `${friend.name.split(" ")[0]} has been nudged! 💪`
                    )
                  }
                >
                  <Text style={s.nudgeSmallText}>👋</Text>
                </TouchableOpacity>
              )}
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* Settings */}
        <View style={[s.sectionHeader, { marginTop: 8 }]}>
          <Text style={s.sectionTitle}>Settings</Text>
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
            style={s.settingsRow}
            onPress={() =>
              Alert.alert(item.label, `${item.label} settings coming soon!`)
            }
          >
            <Text style={s.settingsIcon}>{item.icon}</Text>
            <Text style={s.settingsLabel}>{item.label}</Text>
            <Text style={s.chevron}>›</Text>
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
  container: { flex: 1, backgroundColor: C.bg },

  profileCard: {
    backgroundColor: C.card,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileName: { fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 6 },
  profileTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  profileTag: {
    fontSize: 14,
    color: C.blue,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "700",
  },
  shareBtn: {
    backgroundColor: C.green,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shareBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  profileStats: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 16,
  },
  profileStat: { alignItems: "center" },
  profileStatNum: { fontSize: 22, fontWeight: "800", color: C.text },
  profileStatLabel: {
    fontSize: 11,
    color: C.sub,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: C.border },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: C.text },
  addBtn: {
    backgroundColor: C.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: "700", color: C.text },
  friendTagText: { fontSize: 12, color: C.sub, marginBottom: 4 },
  friendMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  friendMetaText: { fontSize: 12, color: C.sub },
  missedBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  missedText: { fontSize: 11, color: C.red, fontWeight: "700" },
  nudgeSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  nudgeSmallText: { fontSize: 18 },
  chevron: { fontSize: 22, color: C.sub },

  // Friend profile modal
  friendProfileCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  friendProfileAvatar: { fontSize: 64, marginBottom: 12 },
  friendProfileName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },
  friendProfileTag: { fontSize: 14, color: C.blue, marginBottom: 16 },
  friendStats: { flexDirection: "row", gap: 24 },
  friendStat: { alignItems: "center" },
  friendStatNum: { fontSize: 22, fontWeight: "800", color: C.text },
  friendStatLabel: { fontSize: 11, color: C.sub, fontWeight: "600" },

  nudgeBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  nudgeBoxGood: {
    backgroundColor: "#ECFDF5",
    borderColor: C.green,
  },
  nudgeTitle: { fontSize: 15, fontWeight: "700", color: "#9A3412", marginBottom: 4 },
  nudgeSubtitle: { fontSize: 13, color: C.sub, marginBottom: 12 },
  nudgeBtn: {
    backgroundColor: C.yellow,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  nudgeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  nudgeGoodText: { color: C.green, fontWeight: "700", fontSize: 15 },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginBottom: 2,
    padding: 16,
    borderRadius: 12,
  },
  settingsIcon: { fontSize: 20, marginRight: 14 },
  settingsLabel: { flex: 1, fontSize: 15, color: C.text, fontWeight: "600" },

  // Modal shared
  modalSafe: { flex: 1, backgroundColor: C.bg },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.card,
  },
  modalBack: { fontSize: 16, color: C.sub },
  modalTitle: { fontSize: 17, fontWeight: "700", color: C.text },
  modalSave: { fontSize: 16, color: C.blue, fontWeight: "700" },
  modalBody: { flex: 1, padding: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.sub,
    marginBottom: 8,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    fontSize: 15,
    color: C.text,
    marginBottom: 16,
  },
  addFriendHint: { fontSize: 13, color: C.sub, marginTop: 4 },
});
