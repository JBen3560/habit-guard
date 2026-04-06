<<<<<<< Updated upstream
=======
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
>>>>>>> Stashed changes
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Switch,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/context/ThemeContext';
import {
    Task,
    Category,
    CATEGORIES,
    DAY_LABELS,
    CATEGORY_COLORS,
    getColors,
    today,
    todayIdx,
} from '@/src/types';
import { CATEGORY_META, genId } from '@/src/mockData';

<<<<<<< Updated upstream
// ─── CategoryPill ─────────────────────────────────────────────────────────────

const CategoryPill = ({ cat }: { cat: Category }) => {
    const color = CATEGORY_COLORS[cat];
    const icon  = CATEGORY_META[cat].icon as any;
    return (
        <View style={[s.pill, { backgroundColor: color + '22' }]}>
            <MaterialIcons name={icon} size={11} color={color} />
            <Text style={[s.pillText, { color }]}>{cat}</Text>
        </View>
    );
};

// ─── DayToggle ────────────────────────────────────────────────────────────────

const DayToggle = ({
    days,
    onChange,
    C,
}: Readonly<{
    days: boolean[];
    onChange: (i: number) => void;
    C: ReturnType<typeof getColors>;
}>) => (
    <View style={s.dayRow}>
        {DAY_LABELS.map((d, i) => (
            <TouchableOpacity
                key={i}
                onPress={() => onChange(i)}
                style={[
                    s.dayBtn,
                    { borderColor: C.border, backgroundColor: C.card },
                    days[i] && { backgroundColor: C.blue, borderColor: C.blue },
                ]}
            >
                <Text style={[s.dayBtnText, { color: C.sub }, days[i] && { color: '#fff' }]}>
                    {d}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

// ─── ProgressRing ─────────────────────────────────────────────────────────────

function ProgressRing({
    progress,
    size = 160,
    strokeWidth = 11,
    color,
    trackColor,
    children,
}: Readonly<{
    progress: number;
    size?: number;
    strokeWidth?: number;
    color: string;
    trackColor: string;
    children?: React.ReactNode;
}>) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clamped = Math.min(Math.max(progress, 0), 1);
    const offset  = circumference - clamped * circumference;
    const cx = size / 2;
    const cy = size / 2;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
                <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
                <Circle
                    cx={cx} cy={cy} r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="none"
                    rotation="-90"
                    origin={`${cx},${cy}`}
                />
            </Svg>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
        </View>
    );
}

// ─── HabitModal ───────────────────────────────────────────────────────────────
=======
// Helpers to convert between stored "HH:MM" strings and Date objects for the picker
const dateFromHHMM = (hhmm: string): Date => {
    const [h, m] = (hhmm || '08:00').split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
};

const dateToHHMM = (date: Date): string =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

// Habits tab: create/edit habits, track daily progress, and toggle completion state
>>>>>>> Stashed changes

type HabitFormData = Omit<Task, 'id' | 'streakCount' | 'completedToday' | 'skippedToday'>;

const EMPTY_FORM: HabitFormData = {
    title: '',
    category: 'Other',
    time: '08:00',
    days: [true, true, true, true, true, true, true],
    active: true,
};

const REMINDER_TIMES = [
    { value: '06:00', label: '06:00', sub: 'Early'   },
    { value: '08:00', label: '08:00', sub: 'Morning' },
    { value: '12:00', label: '12:00', sub: 'Midday'  },
    { value: '18:00', label: '18:00', sub: 'Evening' },
    { value: '21:00', label: '21:00', sub: 'Night'   },
];

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
    const C = getColors(isDark);
    const [form, setForm] = useState<HabitFormData>(EMPTY_FORM);

    React.useEffect(() => {
        if (visible) {
            setForm(
                initial
                    ? {
                          title:    initial.title,
                          category: initial.category,
                          time:     initial.time,
                          days:     [...initial.days],
                          active:   initial.active,
                      }
                    : { ...EMPTY_FORM, days: [true, true, true, true, true, true, true] },
            );
        }
    }, [visible, initial]);

    const toggleDay = (i: number) => {
        const d = [...form.days];
        d[i] = !d[i];
        setForm({ ...form, days: d });
    };

    const canSave = form.title.trim().length > 0;

<<<<<<< Updated upstream
=======
    const canSave =
        form.title.trim().length > 0 &&
        (!customMode || Platform.OS === 'ios' || validTimeFormat.test(customText));

    // Render modal with form fields for habit name, category, reminder time, active days, and active toggle
>>>>>>> Stashed changes
    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
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

                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <ScrollView
                        style={[s.modalBody, { backgroundColor: C.bg }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Habit Name */}
                        <Text style={[s.fieldLabel, { color: C.sub }]}>HABIT NAME</Text>
                        <TextInput
                            style={[s.textInput, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                            value={form.title}
                            onChangeText={(t) => setForm({ ...form, title: t })}
                            placeholder="e.g. Morning Run"
                            placeholderTextColor={C.sub}
                            maxLength={50}
                            autoFocus
                        />

                        {/* Category */}
                        <Text style={[s.fieldLabel, { color: C.sub }]}>CATEGORY</Text>
                        <View style={s.categoryGrid}>
                            {CATEGORIES.map((cat) => {
                                const isSelected = form.category === cat;
                                const color = CATEGORY_COLORS[cat];
                                const icon  = CATEGORY_META[cat].icon as any;
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setForm({ ...form, category: cat })}
                                        style={[
                                            s.catCard,
                                            { backgroundColor: C.card, borderColor: C.border },
                                            isSelected && { backgroundColor: color + '18', borderColor: color },
                                        ]}
                                    >
                                        <MaterialIcons name={icon} size={18} color={isSelected ? color : C.sub} />
                                        <Text style={[s.catCardText, { color: C.sub }, isSelected && { color, fontWeight: '700' }]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Reminder Time */}
                        <Text style={[s.fieldLabel, { color: C.sub }]}>REMINDER TIME</Text>
                        <Text style={[s.fieldHint, { color: C.sub }]}>Select when you want to be reminded</Text>
                        <View style={s.timeGrid}>
                            {REMINDER_TIMES.map(({ value, label, sub }) => {
                                const isSelected = form.time === value;
                                return (
                                    <TouchableOpacity
                                        key={value}
                                        onPress={() => setForm({ ...form, time: value })}
                                        style={[
                                            s.timeCard,
                                            { backgroundColor: C.card, borderColor: C.border },
                                            isSelected && { borderColor: C.blue, backgroundColor: C.blue + '12' },
                                        ]}
                                    >
                                        <MaterialIcons
                                            name={isSelected ? 'alarm-on' : 'alarm'}
                                            size={18}
                                            color={isSelected ? C.blue : C.sub}
                                        />
                                        <Text style={[s.timeCardLabel, { color: C.sub }, isSelected && { color: C.blue, fontWeight: '700' }]}>
                                            {label}
                                        </Text>
                                        <Text style={[s.timeCardSub, { color: C.sub }, isSelected && { color: C.blue }]}>
                                            {sub}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
<<<<<<< Updated upstream
                        </View>
=======
                            <TouchableOpacity
                                onPress={() => {
                                    setCustomMode(true);
                                    setCustomText('');
                                    if (Platform.OS !== 'ios') setForm({ ...form, time: '' });
                                }}
                                style={[
                                    s.timeCard,
                                    { backgroundColor: C.card, borderColor: C.border },
                                    customMode && { borderColor: C.blue, backgroundColor: `${C.blue}12` },
                                ]}
                            >
                                <MaterialIcons name="edit" size={18} color={customMode ? C.blue : C.sub} />
                                <Text style={[s.timeCardLabel, { color: C.sub }, customMode && { color: C.blue, fontWeight: '700' }]}>
                                    Custom
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {customMode && Platform.OS === 'ios' && (
                            <DateTimePicker
                                mode="time"
                                display="spinner"
                                value={dateFromHHMM(form.time || '08:00')}
                                onChange={(_, date) => {
                                    if (date) setForm({ ...form, time: dateToHHMM(date) });
                                }}
                                textColor={C.text}
                                style={{ marginTop: 8 }}
                            />
                        )}
                        {customMode && Platform.OS !== 'ios' && (
                            <View style={s.customTimeRow}>
                                <MaterialIcons name="schedule" size={18} color={C.sub} />
                                <TextInput
                                    style={[
                                        s.customTimeInput,
                                        { backgroundColor: C.card, borderColor: C.border, color: C.text },
                                        validTimeFormat.test(customText) && { borderColor: C.green },
                                        customText.length > 0 && !validTimeFormat.test(customText) && { borderColor: '#DC2626' },
                                    ]}
                                    value={customText}
                                    onChangeText={handleCustomTimeChange}
                                    placeholder="HH:MM"
                                    placeholderTextColor={C.sub}
                                    keyboardType="numbers-and-punctuation"
                                    maxLength={5}
                                    autoFocus
                                />
                                {customText.length > 0 && !validTimeFormat.test(customText) && (
                                    <Text style={s.customTimeError}>Use HH:MM (e.g. 14:30)</Text>
                                )}
                            </View>
                        )}
>>>>>>> Stashed changes

                        {/* Active Days */}
                        <Text style={[s.fieldLabel, { color: C.sub }]}>ACTIVE DAYS</Text>
                        <DayToggle days={form.days} onChange={toggleDay} C={C} />

                        {/* Active toggle */}
                        <View style={[s.switchRow, { borderColor: C.border }]}>
                            <Text style={[s.fieldLabel, { color: C.sub, marginTop: 0, marginBottom: 0 }]}>Active</Text>
                            <Switch
                                value={form.active}
                                onValueChange={(v) => setForm({ ...form, active: v })}
                                trackColor={{ false: C.border, true: C.green }}
                                thumbColor="#fff"
                            />
                        </View>

                        {initial && onDelete && (
                            <TouchableOpacity style={s.deleteBtn} onPress={onDelete}>
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
                        onPress={() => { if (canSave) onSave(form); }}
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

// ─── HabitsTab ────────────────────────────────────────────────────────────────

type Props = Readonly<{
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}>;

export default function HabitsTab({ tasks, setTasks }: Props) {
    const { isDark } = useTheme();
    const C = getColors(isDark);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Done'>('All');
    const [modalVisible, setModalVisible] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);

    const todayTasks = tasks.filter((t) => t.active && t.days[todayIdx]);
    const pending    = todayTasks.filter((t) => !t.completedToday && !t.skippedToday);
    const done       = todayTasks.filter((t) => t.completedToday || t.skippedToday);
    const filtered   = filter === 'All' ? todayTasks : filter === 'Pending' ? pending : done;

    const progress       = todayTasks.length > 0 ? done.length / todayTasks.length : 0;
    const progressPercent = Math.round(progress * 100);
    const allDone        = todayTasks.length > 0 && done.length === todayTasks.length;
    const ringColor      = allDone ? C.green : C.blue;

    const toggleComplete = (id: string) =>
        setTasks((ts) =>
            ts.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          completedToday: !t.completedToday,
                          skippedToday:   t.completedToday ? t.skippedToday : false,
                          streakCount:    !t.completedToday ? t.streakCount + 1 : Math.max(0, t.streakCount - 1),
                      }
                    : t,
            ),
        );

    const toggleSkip = (id: string) =>
        setTasks((ts) =>
            ts.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          skippedToday:   !t.skippedToday,
                          completedToday: t.skippedToday ? t.completedToday : false,
                      }
                    : t,
            ),
        );

    const saveHabit = (form: HabitFormData) => {
        if (editTask) {
            setTasks((ts) => ts.map((t) => (t.id === editTask.id ? { ...t, ...form } : t)));
        } else {
            setTasks((ts) => [
                ...ts,
                { ...form, id: genId(), streakCount: 0, completedToday: false, skippedToday: false },
            ]);
        }
        setModalVisible(false);
        setEditTask(null);
    };

    const deleteHabit = () => {
        if (editTask) setTasks((ts) => ts.filter((t) => t.id !== editTask.id));
        setModalVisible(false);
        setEditTask(null);
    };

    const openNew  = () => { setEditTask(null); setModalVisible(true); };
    const openEdit = (t: Task) => { setEditTask(t); setModalVisible(true); };

    return (
        <View style={[s.container, { backgroundColor: C.bg }]}>

            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={[s.dateText, { color: C.sub }]}>
                        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    <Text style={[s.titleText, { color: C.text }]}>Today's Habits</Text>
                </View>
                <TouchableOpacity
                    style={[s.addBtn, { backgroundColor: C.blue, shadowColor: C.blue }]}
                    onPress={openNew}
                >
                    <MaterialIcons name="add" size={20} color="#fff" />
                    <Text style={s.addBtnText}>Add</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Ring + Mini Stats */}
            <View style={s.ringSection}>
                <ProgressRing progress={progress} size={168} strokeWidth={11} color={ringColor} trackColor={C.border}>
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
            <View style={s.filterRow}>
                {(['All', 'Pending', 'Done'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[
                            s.filterTab,
                            { backgroundColor: C.card, borderColor: C.border },
                            filter === f && { backgroundColor: C.blue, borderColor: C.blue },
                        ]}
                    >
                        <Text style={[s.filterTabText, { color: C.sub }, filter === f && { color: '#fff' }]}>
                            {f}{' '}
                            {f === 'All' ? `(${todayTasks.length})` : f === 'Pending' ? `(${pending.length})` : `(${done.length})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

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
                    const catIcon  = CATEGORY_META[task.category].icon as any;
                    const isDone   = task.completedToday;
                    const isSkipped = task.skippedToday;

                    return (
                        <TouchableOpacity
                            key={task.id}
                            style={[s.taskCard, { backgroundColor: C.card }]}
                            onPress={() => openEdit(task)}
                            activeOpacity={0.8}
                        >
                            <View style={[s.taskAccent, { backgroundColor: catColor }]} />

                            {/* Category icon */}
                            <View style={[s.taskIconWrap, { backgroundColor: catColor + '18' }]}>
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
                                    <Text style={[s.taskTime, { color: C.sub }]}>{task.time}</Text>
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
                                    <TouchableOpacity style={s.completedBadge} onPress={() => toggleComplete(task.id)}>
                                        <MaterialIcons name="check-circle" size={14} color="#166534" />
                                        <Text style={s.completedText}>Done</Text>
                                        <Text style={[s.undoHint, { color: C.sub }]}>undo</Text>
                                    </TouchableOpacity>
                                ) : isSkipped ? (
                                    <TouchableOpacity style={[s.completedBadge, s.skippedBadge]} onPress={() => toggleSkip(task.id)}>
                                        <MaterialIcons name="skip-next" size={14} color="#A16207" />
                                        <Text style={[s.completedText, s.skippedText]}>Skipped</Text>
                                        <Text style={[s.undoHint, { color: C.sub }]}>undo</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={s.actionBtns}>
                                        <TouchableOpacity style={[s.skipBtn, { borderColor: C.border }]} onPress={() => toggleSkip(task.id)}>
                                            <Text style={[s.skipBtnText, { color: C.sub }]}>Skip</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[s.doneBtn, { backgroundColor: C.blue }]} onPress={() => toggleComplete(task.id)}>
                                            <MaterialIcons name="check" size={13} color="#fff" />
                                            <Text style={s.doneBtnText}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
                <View style={{ height: 20 }} />
            </ScrollView>

            <HabitModal
                visible={modalVisible}
                initial={editTask}
                onSave={saveHabit}
                onDelete={editTask ? deleteHabit : undefined}
                onClose={() => { setModalVisible(false); setEditTask(null); }}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    dateText:  { fontSize: 12, fontWeight: '500', marginBottom: 2 },
    titleText: { fontSize: 24, fontWeight: '800' },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
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
    ringLabel:   { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    ringStats:   { flex: 1, gap: 8 },
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
    miniStatNum:   { fontSize: 20, fontWeight: '800' },
    miniStatLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

    // Filters
    filterRow:     { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 8 },
    filterTab:     { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
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
    taskAccent:   { width: 4, height: 48, borderRadius: 2 },
    taskIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    taskInfo:     { flex: 1 },
    taskTitle:    { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    taskMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
    taskTime:     { fontSize: 12 },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    streakText:  { fontSize: 11, color: '#92400E', fontWeight: '700' },
    taskActions: { alignItems: 'flex-end' },
    actionBtns:  { gap: 6 },
    skipBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
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
    skippedText:   { color: '#A16207' },
    undoHint:      { fontSize: 9 },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        alignSelf: 'flex-start',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    pillText: { fontSize: 10, fontWeight: '700' },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
    emptyTitle: { fontSize: 17, fontWeight: '700' },
    emptySub:   { fontSize: 13, textAlign: 'center' },

    // Modal
    modalSafe: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalCloseBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
    modalTitle:    { fontSize: 17, fontWeight: '700' },
    modalBody:     { flex: 1, padding: 20 },
    fieldLabel:    { fontSize: 11, fontWeight: '700', marginBottom: 8, marginTop: 16, letterSpacing: 0.8 },
    fieldHint:     { fontSize: 12, marginTop: -4, marginBottom: 10 },
    textInput:     { borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 15, marginBottom: 4 },

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
    timeCardSub:   { fontSize: 10 },

    dayRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    dayBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    dayBtnText: { fontSize: 13, fontWeight: '600' },

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
