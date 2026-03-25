import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  Task,
  Category,
  CATEGORIES,
  DAY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  C,
  genId,
  today,
  todayIdx,
} from "./types";

// ─── CategoryPill ─────────────────────────────────────────────────────────────

const CategoryPill = ({ cat }: { cat: Category }) => (
  <View style={[s.pill, { backgroundColor: CATEGORY_COLORS[cat] + "22" }]}>
    <Text style={[s.pillText, { color: CATEGORY_COLORS[cat] }]}>
      {cat}
    </Text>
  </View>
);

// ─── DayToggle ────────────────────────────────────────────────────────────────

const DayToggle = ({
  days,
  onChange,
}: {
  days: boolean[];
  onChange: (i: number) => void;
}) => (
  <View style={s.dayRow}>
    {DAY_LABELS.map((d, i) => (
      <TouchableOpacity
        key={i}
        onPress={() => onChange(i)}
        style={[s.dayBtn, days[i] && s.dayBtnActive]}
      >
        <Text style={[s.dayBtnText, days[i] && s.dayBtnTextActive]}>{d}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Task Modal ───────────────────────────────────────────────────────────────

type TaskFormData = Omit<Task, "id" | "streakCount" | "completedToday" | "skippedToday">;

const EMPTY_FORM: TaskFormData = {
  title: "",
  category: "Other",
  time: "08:00",
  days: [true, true, true, true, true, true, true],
  active: true,
};

function TaskModal({
  visible,
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  visible: boolean;
  initial?: Task | null;
  onSave: (t: TaskFormData) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TaskFormData>(EMPTY_FORM);

  React.useEffect(() => {
    if (visible) {
      setForm(
        initial
          ? {
              title: initial.title,
              category: initial.category,
              time: initial.time,
              days: [...initial.days],
              active: initial.active,
            }
          : { ...EMPTY_FORM, days: [true, true, true, true, true, true, true] }
      );
    }
  }, [visible, initial]);

  const toggleDay = (i: number) => {
    const d = [...form.days];
    d[i] = !d[i];
    setForm({ ...form, days: d });
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
            <Text style={s.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.modalTitle}>{initial ? "Edit Task" : "New Task"}</Text>
          <TouchableOpacity
            onPress={() => {
              if (form.title.trim()) onSave(form);
            }}
          >
            <Text style={s.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
          <Text style={s.fieldLabel}>Task Name</Text>
          <TextInput
            style={s.textInput}
            value={form.title}
            onChangeText={(t) => setForm({ ...form, title: t })}
            placeholder="e.g. Morning Run"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={s.fieldLabel}>Time</Text>
          <TextInput
            style={s.textInput}
            value={form.time}
            onChangeText={(t) => setForm({ ...form, time: t })}
            placeholder="HH:MM"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={s.fieldLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setForm({ ...form, category: cat })}
                style={[
                  s.catOption,
                  form.category === cat && {
                    backgroundColor: CATEGORY_COLORS[cat],
                    borderColor: CATEGORY_COLORS[cat],
                  },
                ]}
              >
                <Text
                  style={[
                    s.catOptionText,
                    form.category === cat && { color: "#fff" },
                  ]}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.fieldLabel}>Active Days</Text>
          <DayToggle days={form.days} onChange={toggleDay} />

          <View style={s.switchRow}>
            <Text style={s.fieldLabel}>Active</Text>
            <Switch
              value={form.active}
              onValueChange={(v) => setForm({ ...form, active: v })}
              trackColor={{ false: "#E5E7EB", true: C.green }}
              thumbColor="#fff"
            />
          </View>

          {initial && onDelete && (
            <TouchableOpacity style={s.deleteBtn} onPress={onDelete}>
              <Text style={s.deleteBtnText}>🗑 Delete Task</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── TasksTab ─────────────────────────────────────────────────────────────────

type Props = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

export default function TasksTab({ tasks, setTasks }: Props) {
  const [filter, setFilter] = useState<"All" | "Pending" | "Done">("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const todayTasks = tasks.filter((t) => t.active && t.days[todayIdx]);
  const pending = todayTasks.filter((t) => !t.completedToday && !t.skippedToday);
  const done = todayTasks.filter((t) => t.completedToday || t.skippedToday);
  const filtered =
    filter === "All" ? todayTasks : filter === "Pending" ? pending : done;

  // Toggle complete — pressing again undoes it
  const toggleComplete = (id: string) =>
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? {
              ...t,
              completedToday: !t.completedToday,
              skippedToday: t.completedToday ? t.skippedToday : false, // clear skip if marking done
              streakCount: !t.completedToday
                ? t.streakCount + 1
                : Math.max(0, t.streakCount - 1),
            }
          : t
      )
    );

  // Toggle skip — pressing again undoes it
  const toggleSkip = (id: string) =>
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? {
              ...t,
              skippedToday: !t.skippedToday,
              completedToday: t.skippedToday ? t.completedToday : false, // clear done if skipping
            }
          : t
      )
    );

  const saveTask = (form: TaskFormData) => {
    if (editTask) {
      setTasks((ts) => ts.map((t) => (t.id === editTask.id ? { ...t, ...form } : t)));
    } else {
      setTasks((ts) => [
        ...ts,
        {
          ...form,
          id: genId(),
          streakCount: 0,
          completedToday: false,
          skippedToday: false,
        },
      ]);
    }
    setModalVisible(false);
    setEditTask(null);
  };

  const deleteTask = () => {
    if (editTask) setTasks((ts) => ts.filter((t) => t.id !== editTask.id));
    setModalVisible(false);
    setEditTask(null);
  };

  const openNew = () => {
    setEditTask(null);
    setModalVisible(true);
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setModalVisible(true);
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.dateText}>
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text style={s.titleText}>Today's Tasks</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={openNew}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsBar}>
        <View style={s.statItem}>
          <Text style={s.statNum}>{todayTasks.length}</Text>
          <Text style={s.statLabel}>TOTAL</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: C.yellow }]}>{pending.length}</Text>
          <Text style={s.statLabel}>PENDING</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: C.green }]}>{done.length}</Text>
          <Text style={s.statLabel}>DONE</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={s.filterRow}>
        {(["All", "Pending", "Done"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[s.filterTab, filter === f && s.filterTabActive]}
          >
            <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>
              {f}{" "}
              {f === "All"
                ? `(${todayTasks.length})`
                : f === "Pending"
                ? `(${pending.length})`
                : `(${done.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        {filtered.map((task) => {
          const catColor = CATEGORY_COLORS[task.category];
          const isDone = task.completedToday;
          const isSkipped = task.skippedToday;

          return (
            <TouchableOpacity
              key={task.id}
              style={s.taskCard}
              onPress={() => openEdit(task)}
              activeOpacity={0.8}
            >
              <View style={[s.taskAccent, { backgroundColor: catColor }]} />
              <View style={s.taskInfo}>
                <Text style={[s.taskTitle, (isDone || isSkipped) && s.taskTitleDone]}>
                  {task.title}
                </Text>
                <View style={s.taskMeta}>
                  <Text style={s.taskTime}>{task.time}</Text>
                  {task.streakCount > 0 && (
                    <View style={s.streakBadge}>
                      <Text style={s.streakText}>🔥 {task.streakCount}</Text>
                    </View>
                  )}
                </View>
                <CategoryPill cat={task.category} />
              </View>

              <View style={s.taskActions}>
                {isDone ? (
                  // Tap to undo done
                  <TouchableOpacity
                    style={s.completedBadge}
                    onPress={() => toggleComplete(task.id)}
                  >
                    <Text style={s.completedText}>Done</Text>
                    <Text style={s.undoHint}>tap to undo</Text>
                  </TouchableOpacity>
                ) : isSkipped ? (
                  // Tap to undo skip
                  <TouchableOpacity
                    style={[s.completedBadge, s.skippedBadge]}
                    onPress={() => toggleSkip(task.id)}
                  >
                    <Text style={[s.completedText, s.skippedText]}>Skipped</Text>
                    <Text style={s.undoHint}>tap to undo</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={s.actionBtns}>
                    <TouchableOpacity
                      style={s.skipBtn}
                      onPress={() => toggleSkip(task.id)}
                    >
                      <Text style={s.skipBtnText}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.doneBtn}
                      onPress={() => toggleComplete(task.id)}
                    >
                      <Text style={s.doneBtnText}>✓ Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      <TaskModal
        visible={modalVisible}
        initial={editTask}
        onSave={saveTask}
        onDelete={editTask ? deleteTask : undefined}
        onClose={() => {
          setModalVisible(false);
          setEditTask(null);
        }}
      />
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

  taskCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    padding: 14,
  },
  taskAccent: { width: 4, height: 48, borderRadius: 2, marginRight: 12 },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 4 },
  taskTitleDone: { color: C.sub, textDecorationLine: "line-through" },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  taskTime: { fontSize: 12, color: C.sub },
  streakBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakText: { fontSize: 11, color: "#92400E", fontWeight: "700" },

  taskActions: { alignItems: "flex-end" },
  actionBtns: { gap: 6 },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  skipBtnText: { fontSize: 12, color: C.sub, fontWeight: "600" },
  doneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.blue,
  },
  doneBtnText: { fontSize: 12, color: "#fff", fontWeight: "700" },
  completedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  skippedBadge: { backgroundColor: "#FEF9C3" },
  completedText: { fontSize: 12, color: "#166534", fontWeight: "700" },
  skippedText: { color: "#A16207" },
  undoHint: { fontSize: 9, color: C.sub, marginTop: 2 },

  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillText: { fontSize: 10, fontWeight: "700" },

  // Modal
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
  modalCancel: { fontSize: 16, color: C.sub },
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
  dayRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  dayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  dayBtnActive: { backgroundColor: C.blue, borderColor: C.blue },
  dayBtnText: { fontSize: 13, fontWeight: "600", color: C.sub },
  dayBtnTextActive: { color: "#fff" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  catOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
    backgroundColor: C.card,
  },
  catOptionText: { fontSize: 13, fontWeight: "600", color: C.text },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  deleteBtnText: { color: C.red, fontWeight: "700", fontSize: 15 },
});
