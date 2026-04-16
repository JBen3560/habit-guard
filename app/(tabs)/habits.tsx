import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryPill from '@/components/CategoryPill';
import DayToggle from '@/components/DayToggle';
import ProgressRing from '@/components/ProgressRing';
import { createTask, deleteTask, updateTask } from '@/lib/tasks';
import { useTheme } from '@/src/context/ThemeContext';
import { useTimeFormat } from '@/src/context/TimeFormatContext';
import { CATEGORY_META } from '@/src/mockData';
import { type Task, CATEGORIES, CATEGORY_COLORS, getColors, today, todayIdx } from '@/src/types';

// Habits tab: create/edit habits, track daily progress, and toggle completion state

//  HabitModal component: form for creating/editing habits
type HabitFormData = Omit<Task, 'id' | 'streakCount' | 'completedToday' | 'skippedToday'>;

// Default form values for new habit creation
const EMPTY_FORM: HabitFormData = {
  title: '',
  category: 'Other',
  time: '08:00',
  days: [true, true, true, true, true, true, true],
  active: true,
};

// Predefined reminder time options for habit notifications
const REMINDER_TIMES = [
  { value: '06:00', label: '06:00', sub: 'Early' },
  { value: '08:00', label: '08:00', sub: 'Morning' },
  { value: '12:00', label: '12:00', sub: 'Midday' },
  { value: '18:00', label: '18:00', sub: 'Evening' },
  { value: '21:00', label: '21:00', sub: 'Night' },
];

// Modal component for creating or editing a habit
function HabitModal({
  visible,
  initial,
  onSave,
  onDelete,
  onClose,
}: Readonly<{
  visible: boolean;
  initial?: Task | null;
  onSave: (t: HabitFormData) => void;
  onDelete?: () => void;
  onClose: () => void;
}>) {
  const { isDark } = useTheme();
  const { formatTime } = useTimeFormat();
  const C = getColors(isDark);
  const [form, setForm] = useState<HabitFormData>(EMPTY_FORM);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');

  const isPresetTime = (t: string) => REMINDER_TIMES.some((r) => r.value === t);
  const validTimeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

  React.useEffect(() => {
    if (visible) {
      const t = initial?.time ?? EMPTY_FORM.time;
      const isCustom = !isPresetTime(t);
      setForm(
        initial
          ? {
              title: initial.title,
              category: initial.category,
              time: initial.time,
              days: [...initial.days],
              active: initial.active,
            }
          : { ...EMPTY_FORM, days: [true, true, true, true, true, true, true] },
      );
      setCustomMode(isCustom);
      setCustomText(isCustom ? t : '');
    }
  }, [visible, initial]);

  const toggleDay = (i: number) => {
    const d = [...form.days];
    d[i] = !d[i];
    setForm({ ...form, days: d });
  };

  const handleCustomTimeChange = (text: string) => {
    setCustomText(text);
    if (validTimeFormat.test(text)) {
      setForm({ ...form, time: text });
    }
  };

  const canSave = form.title.trim().length > 0 && (!customMode || validTimeFormat.test(customText));

  // Render modal with form fields for habit name, category, reminder time, active days, and active toggle
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.modalSafe, { backgroundColor: C.bg }]}>
        {/* Header */}
        <View style={[s.modalHeader, { borderBottomColor: C.border, backgroundColor: C.card }]}>
          <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
            <MaterialIcons name="close" size={22} color={C.sub} />
          </TouchableOpacity>
          <Text style={[s.modalTitle, { color: C.text }]}>
            {initial ? 'Edit Habit' : 'New Habit'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={[s.modalBody, { backgroundColor: C.bg }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Habit Name */}
            <Text style={[s.fieldLabel, { color: C.sub }]}>HABIT NAME</Text>
            <TextInput
              style={[
                s.textInput,
                { backgroundColor: C.card, borderColor: C.border, color: C.text },
              ]}
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
              placeholder="e.g. Morning Run"
              placeholderTextColor={C.sub}
              maxLength={50}
            />

            {/* Category */}
            <Text style={[s.fieldLabel, { color: C.sub }]}>CATEGORY</Text>
            <View style={s.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = form.category === cat;
                const color = CATEGORY_COLORS[cat];
                const icon = CATEGORY_META[cat].icon as React.ComponentProps<
                  typeof MaterialIcons
                >['name'];
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setForm({ ...form, category: cat })}
                    style={[
                      s.catCard,
                      { backgroundColor: C.card, borderColor: C.border },
                      isSelected && { backgroundColor: `${color}18`, borderColor: color },
                    ]}
                  >
                    <MaterialIcons name={icon} size={18} color={isSelected ? color : C.sub} />
                    <Text
                      style={[
                        s.catCardText,
                        { color: C.sub },
                        isSelected && { color, fontWeight: '700' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Reminder Time */}
            <Text style={[s.fieldLabel, { color: C.sub }]}>REMINDER TIME</Text>
            <Text style={[s.fieldHint, { color: C.sub }]}>
              Select a preset or enter a custom time
            </Text>
            <View style={s.timeGrid}>
              {REMINDER_TIMES.map(({ value, sub }) => {
                const isSelected = !customMode && form.time === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      setCustomMode(false);
                      setCustomText('');
                      setForm({ ...form, time: value });
                    }}
                    style={[
                      s.timeCard,
                      { backgroundColor: C.card, borderColor: C.border },
                      isSelected && { borderColor: C.blue, backgroundColor: `${C.blue}12` },
                    ]}
                  >
                    <MaterialIcons
                      name={isSelected ? 'alarm-on' : 'alarm'}
                      size={18}
                      color={isSelected ? C.blue : C.sub}
                    />
                    <Text
                      style={[
                        s.timeCardLabel,
                        { color: C.sub },
                        isSelected && { color: C.blue, fontWeight: '700' },
                      ]}
                    >
                      {formatTime(value)}
                    </Text>
                    <Text
                      style={[s.timeCardSub, { color: C.sub }, isSelected && { color: C.blue }]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => {
                  setCustomMode(true);
                  setCustomText('');
                  setForm({ ...form, time: '' });
                }}
                style={[
                  s.timeCard,
                  { backgroundColor: C.card, borderColor: C.border },
                  customMode && { borderColor: C.blue, backgroundColor: `${C.blue}12` },
                ]}
              >
                <MaterialIcons name="edit" size={18} color={customMode ? C.blue : C.sub} />
                <Text
                  style={[
                    s.timeCardLabel,
                    { color: C.sub },
                    customMode && { color: C.blue, fontWeight: '700' },
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
            {customMode && (
              <View style={s.customTimeRow}>
                <MaterialIcons name="schedule" size={18} color={C.sub} />
                <TextInput
                  style={[
                    s.customTimeInput,
                    { backgroundColor: C.card, borderColor: C.border, color: C.text },
                    validTimeFormat.test(customText) && { borderColor: C.green },
                    customText.length > 0 &&
                      !validTimeFormat.test(customText) && { borderColor: '#DC2626' },
                  ]}
                  value={customText}
                  onChangeText={handleCustomTimeChange}
                  placeholder="HH:MM"
                  placeholderTextColor={C.sub}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                {customText.length > 0 && !validTimeFormat.test(customText) && (
                  <Text style={s.customTimeError}>Use HH:MM (e.g. 14:30)</Text>
                )}
              </View>
            )}

            {/* Active Days */}
            <Text style={[s.fieldLabel, { color: C.sub }]}>ACTIVE DAYS</Text>
            <DayToggle days={form.days} onChange={toggleDay} C={C} />

            {/* Active toggle */}
            <View style={[s.switchRow, { borderColor: C.border }]}>
              <Text style={[s.fieldLabel, { color: C.sub, marginTop: 0, marginBottom: 0 }]}>
                Active
              </Text>
              <Switch
                value={form.active}
                onValueChange={(v) => setForm({ ...form, active: v })}
                trackColor={{ false: C.border, true: C.green }}
                thumbColor="#fff"
              />
            </View>

            {initial && onDelete && (
              <TouchableOpacity
                style={s.deleteBtn}
                onPress={() =>
                  Alert.alert('Delete Habit', `Delete "${initial.title}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: onDelete },
                  ])
                }
              >
                <MaterialIcons name="delete-outline" size={18} color="#DC2626" />
                <Text style={[s.deleteBtnText, { color: '#DC2626' }]}>Delete Habit</Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Sticky Save Button */}
        <View style={[s.modalCta, { backgroundColor: C.bg, borderTopColor: C.border }]}>
          <TouchableOpacity
            style={[s.modalSaveBtn, { backgroundColor: C.blue }, !canSave && { opacity: 0.4 }]}
            onPress={() => {
              if (canSave) onSave(form);
            }}
            disabled={!canSave}
          >
            <MaterialIcons name={initial ? 'check' : 'add-circle'} size={20} color="#fff" />
            <Text style={s.modalSaveBtnText}>{initial ? 'Save Changes' : 'Create Habit'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// HabitsTab component: main screen for displaying today's habits, progress, and filter options

type Props = Readonly<{
  tasks: Task[];
  refreshTasks: () => Promise<void>;
  onToggleComplete: (id: string) => void;
  onToggleSkip: (id: string) => void;
}>;

// Categories and colors for habits
export default function HabitsTab({ tasks, refreshTasks, onToggleComplete, onToggleSkip }: Props) {
  const { isDark } = useTheme();
  const { formatTime } = useTimeFormat();
  const C = getColors(isDark);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Done' | 'Skipped'>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const swipeOpenId = useRef<string | null>(null);

  const todayTasks = tasks.filter((t) => t.active && t.days[todayIdx]);
  const inactiveTasks = tasks
    .filter((t) => !t.active || !t.days[todayIdx])
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));
  const pending = todayTasks.filter((t) => !t.completedToday && !t.skippedToday);
  const skipped = todayTasks.filter((t) => t.skippedToday);
  const done = todayTasks.filter((t) => t.completedToday);
  const byTime = (a: Task, b: Task) => a.time.localeCompare(b.time);
  const filtered = (
    filter === 'All'
      ? todayTasks
      : filter === 'Pending'
        ? pending
        : filter === 'Skipped'
          ? skipped
          : done
  )
    .slice()
    .sort(byTime);

  const progress = todayTasks.length > 0 ? done.length / todayTasks.length : 0;
  const progressPercent = Math.round(progress * 100);
  const allDone = todayTasks.length > 0 && done.length === todayTasks.length;
  const ringColor = allDone ? C.green : C.blue;

  const saveHabit = async (form: HabitFormData) => {
    try {
      if (editTask) {
        await updateTask(editTask.id, form);
      } else {
        await createTask(form);
      }
      await refreshTasks();
    } catch {
      Alert.alert('Error', 'Could not save habit. Please try again.');
      return;
    }
    setModalVisible(false);
    setEditTask(null);
  };

  // Delete habit and close modal
  const deleteHabit = async () => {
    if (editTask) {
      try {
        await deleteTask(editTask.id);
        await refreshTasks();
      } catch {
        Alert.alert('Error', 'Could not delete habit.');
        return;
      }
    }
    setModalVisible(false);
    setEditTask(null);
  };

  // Open modal for new habit creation or editing existing habit
  const openNew = () => {
    setEditTask(null);
    setModalVisible(true);
  };
  const openEdit = (t: Task) => {
    setEditTask(t);
    setModalVisible(true);
  };

  // Render main habits screen with progress ring, filter options, and list of today's habits with category pills and completion status
  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={[s.dateText, { color: C.sub }]}>
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={[s.titleText, { color: C.text }]}>Today&apos;s Habits</Text>
        </View>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: C.blue }]}
          onPress={openNew}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Ring + Mini Stats */}
      <View style={s.ringSection}>
        <ProgressRing
          progress={progress}
          size={168}
          strokeWidth={11}
          color={ringColor}
          trackColor={C.border}
        >
          <Text style={[s.ringPercent, { color: ringColor }]}>{progressPercent}%</Text>
          <Text style={[s.ringLabel, { color: C.sub }]}>COMPLETED</Text>
        </ProgressRing>

        <View style={s.ringStats}>
          <View style={[s.miniStat, { backgroundColor: C.card }]}>
            <MaterialIcons name="list" size={14} color={C.sub} />
            <Text style={[s.miniStatNum, { color: C.text }]}>{todayTasks.length}</Text>
            <Text style={[s.miniStatLabel, { color: C.sub }]}>TOTAL</Text>
          </View>
          <View style={[s.miniStat, { backgroundColor: C.card }]}>
            <MaterialIcons name="pending" size={14} color={C.yellow} />
            <Text style={[s.miniStatNum, { color: C.yellow }]}>{pending.length}</Text>
            <Text style={[s.miniStatLabel, { color: C.sub }]}>PENDING</Text>
          </View>
          <View style={[s.miniStat, { backgroundColor: C.card }]}>
            <MaterialIcons name="check-circle" size={14} color={C.green} />
            <Text style={[s.miniStatNum, { color: C.green }]}>{done.length}</Text>
            <Text style={[s.miniStatLabel, { color: C.sub }]}>DONE</Text>
          </View>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterRow}
        contentContainerStyle={s.filterRowContent}
      >
        {(['All', 'Pending', 'Done', 'Skipped'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            activeOpacity={1}
            style={[
              s.filterTab,
              { backgroundColor: C.card, borderColor: C.border },
              filter === f && { backgroundColor: C.blue, borderColor: C.blue },
            ]}
          >
            <Text style={[s.filterTabText, { color: C.sub }, filter === f && { color: '#fff' }]}>
              {f}{' '}
              {f === 'All'
                ? `(${todayTasks.length})`
                : f === 'Pending'
                  ? `(${pending.length})`
                  : f === 'Skipped'
                    ? `(${skipped.length})`
                    : `(${done.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Habit list */}
      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <MaterialIcons
              name={filter === 'Pending' ? 'check-circle' : 'add-task'}
              size={52}
              color={filter === 'Pending' ? C.green : C.sub}
            />
            <Text style={[s.emptyTitle, { color: C.text }]}>
              {filter === 'Pending' ? 'All done for today!' : 'No habits here'}
            </Text>
            <Text style={[s.emptySub, { color: C.sub }]}>
              {filter === 'Pending'
                ? "You've completed all your habits"
                : 'Switch filter or tap Add to create one'}
            </Text>
          </View>
        )}

        {filtered.map((task) => {
          const catColor = CATEGORY_COLORS[task.category];
          const catIcon = CATEGORY_META[task.category].icon as React.ComponentProps<
            typeof MaterialIcons
          >['name'];
          const isDone = task.completedToday;
          const isSkipped = task.skippedToday;

          const renderRightActions = () => (
            <TouchableOpacity
              style={s.swipeDelete}
              onPress={() =>
                Alert.alert('Delete Habit', `Delete "${task.title}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () =>
                      deleteTask(task.id)
                        .then(refreshTasks)
                        .catch(() => Alert.alert('Error', 'Could not delete habit.')),
                  },
                ])
              }
            >
              <MaterialIcons name="delete-outline" size={22} color="#fff" />
              <Text style={s.swipeDeleteText}>Delete</Text>
            </TouchableOpacity>
          );

          return (
            <Swipeable
              key={task.id}
              renderRightActions={renderRightActions}
              overshootRight={false}
              onSwipeableOpen={() => {
                swipeOpenId.current = task.id;
              }}
              onSwipeableClose={() => {
                swipeOpenId.current = null;
              }}
            >
              <TouchableOpacity
                style={[s.taskCard, { backgroundColor: C.card }]}
                onPress={() => {
                  if (swipeOpenId.current === null) openEdit(task);
                }}
                activeOpacity={0.8}
              >
                <View style={[s.taskAccent, { backgroundColor: catColor }]} />

                {/* Category icon */}
                <View style={[s.taskIconWrap, { backgroundColor: `${catColor}18` }]}>
                  <MaterialIcons name={catIcon} size={18} color={catColor} />
                </View>

                <View style={s.taskInfo}>
                  <Text
                    style={[
                      s.taskTitle,
                      { color: C.text },
                      (isDone || isSkipped) && { color: C.sub, textDecorationLine: 'line-through' },
                    ]}
                  >
                    {task.title}
                  </Text>
                  <View style={s.taskMeta}>
                    <MaterialIcons name="schedule" size={11} color={C.sub} />
                    <Text style={[s.taskTime, { color: C.sub }]}>{formatTime(task.time)}</Text>
                    {task.streakCount > 0 && (
                      <View style={s.streakBadge}>
                        <MaterialIcons name="local-fire-department" size={11} color="#92400E" />
                        <Text style={s.streakText}>{task.streakCount}</Text>
                      </View>
                    )}
                  </View>
                  <CategoryPill cat={task.category} />
                </View>

                <View style={s.taskActions}>
                  {isDone ? (
                    <TouchableOpacity
                      style={s.completedBadge}
                      onPress={() => onToggleComplete(task.id)}
                    >
                      <MaterialIcons name="check-circle" size={14} color="#166534" />
                      <Text style={s.completedText}>Done</Text>
                      <Text style={[s.undoHint, { color: C.sub }]}>undo</Text>
                    </TouchableOpacity>
                  ) : isSkipped ? (
                    <TouchableOpacity
                      style={[s.completedBadge, s.skippedBadge]}
                      onPress={() => onToggleSkip(task.id)}
                    >
                      <MaterialIcons name="skip-next" size={14} color="#A16207" />
                      <Text style={[s.completedText, s.skippedText]}>Skipped</Text>
                      <Text style={[s.undoHint, { color: C.sub }]}>undo</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={s.actionBtns}>
                      <TouchableOpacity
                        style={[s.skipBtn, { borderColor: C.border }]}
                        onPress={() => onToggleSkip(task.id)}
                      >
                        <Text style={[s.skipBtnText, { color: C.sub }]}>Skip</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.doneBtn, { backgroundColor: C.blue }]}
                        onPress={() => onToggleComplete(task.id)}
                      >
                        <Text style={s.doneBtnText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        })}

        {inactiveTasks.length > 0 && (
          <View style={s.inactiveSection}>
            <Text style={[s.inactiveTitle, { color: C.text }]}>Inactive Habits</Text>
            <Text style={[s.inactiveHint, { color: C.sub }]}>
              Includes turned-off habits and habits not scheduled for today. Tap to edit.
            </Text>

            {inactiveTasks.map((task) => {
              const catColor = CATEGORY_COLORS[task.category];
              const catIcon = CATEGORY_META[task.category].icon as React.ComponentProps<
                typeof MaterialIcons
              >['name'];
              const statusLabel = task.active ? 'Not Today' : 'Inactive';

              return (
                <TouchableOpacity
                  key={`inactive-${task.id}`}
                  style={[s.taskCard, s.inactiveCard, { backgroundColor: C.card }]}
                  onPress={() => openEdit(task)}
                  activeOpacity={0.8}
                >
                  <View style={[s.taskAccent, { backgroundColor: C.sub }]} />

                  <View style={[s.taskIconWrap, { backgroundColor: `${catColor}18` }]}>
                    <MaterialIcons name={catIcon} size={18} color={catColor} />
                  </View>

                  <View style={s.taskInfo}>
                    <Text style={[s.taskTitle, { color: C.sub }]}>{task.title}</Text>
                    <View style={s.taskMeta}>
                      <MaterialIcons name="schedule" size={11} color={C.sub} />
                      <Text style={[s.taskTime, { color: C.sub }]}>{formatTime(task.time)}</Text>
                    </View>
                    <CategoryPill cat={task.category} />
                  </View>

                  <View style={s.taskActions}>
                    <View style={[s.inactiveBadge, { borderColor: C.border }]}>
                      <Text style={[s.inactiveBadgeText, { color: C.sub }]}>{statusLabel}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <HabitModal
        visible={modalVisible}
        initial={editTask}
        onSave={saveHabit}
        onDelete={editTask ? deleteHabit : undefined}
        onClose={() => {
          setModalVisible(false);
          setEditTask(null);
        }}
      />
    </View>
  );
}

// Styles for HabitsTab and HabitModal components

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  dateText: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  titleText: { fontSize: 24, fontWeight: '800' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Progress ring
  ringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 20,
  },
  ringPercent: { fontSize: 34, fontWeight: '800', lineHeight: 38 },
  ringLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  ringStats: { flex: 1, gap: 8 },
  miniStat: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  miniStatNum: { fontSize: 20, fontWeight: '800' },
  miniStatLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Filters
  filterRow: { paddingHorizontal: 20, marginBottom: 12, flexGrow: 0 },
  filterRowContent: { flexDirection: 'row', gap: 8 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  filterTabText: { fontSize: 13, fontWeight: '600' },

  // Habit cards
  list: { flex: 1, paddingHorizontal: 20 },
  taskCard: {
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    padding: 14,
    gap: 10,
  },
  taskAccent: { width: 4, height: 48, borderRadius: 2 },
  taskIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  taskTime: { fontSize: 12 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakText: { fontSize: 11, color: '#92400E', fontWeight: '700' },
  taskActions: { alignItems: 'flex-end' },
  swipeDelete: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
    gap: 4,
  },
  swipeDeleteText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  actionBtns: { gap: 6 },
  skipBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  skipBtnText: { fontSize: 12, fontWeight: '600' },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  doneBtnText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  completedBadge: {
    alignItems: 'center',
    gap: 1,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  skippedBadge: { backgroundColor: '#FEF9C3' },
  completedText: { fontSize: 12, color: '#166534', fontWeight: '700' },
  skippedText: { color: '#A16207' },
  undoHint: { fontSize: 9 },
  inactiveSection: { marginTop: 8, marginBottom: 4 },
  inactiveTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  inactiveHint: { fontSize: 12, marginBottom: 10 },
  inactiveCard: { opacity: 0.92 },
  inactiveBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  inactiveBadgeText: { fontSize: 12, fontWeight: '700' },
  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center' },

  // Modal
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalBody: { flex: 1, padding: 20 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.8,
  },
  fieldHint: { fontSize: 12, marginTop: -4, marginBottom: 10 },
  textInput: { borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 15, marginBottom: 4 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  catCardText: { fontSize: 13 },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  timeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 3,
    minWidth: 56,
  },
  timeCardLabel: { fontSize: 12, fontWeight: '600' },
  timeCardSub: { fontSize: 10 },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  customTimeInput: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    width: 90,
    textAlign: 'center',
    letterSpacing: 2,
  },
  customTimeError: { fontSize: 12, color: '#DC2626', flex: 1 },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  deleteBtnText: { fontWeight: '700', fontSize: 15 },

  modalCta: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1 },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  modalSaveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
