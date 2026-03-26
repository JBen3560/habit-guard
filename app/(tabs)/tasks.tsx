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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import {
    Task,
    Category,
    CATEGORIES,
    DAY_LABELS,
    CATEGORY_COLORS,
    CATEGORY_ICONS,
    getColors,
    genId,
    today,
    todayIdx,
} from '@/src/types';

// CategoryPill

const CategoryPill = ({ cat }: { cat: Category }) => (
    <View style={[s.pill, { backgroundColor: CATEGORY_COLORS[cat] + '22' }]}>
        <Text style={[s.pillText, { color: CATEGORY_COLORS[cat] }]}>{cat}</Text>
    </View>
);

// DayToggle

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

// Tasks

type TaskFormData = Omit<Task, 'id' | 'streakCount' | 'completedToday' | 'skippedToday'>;

const EMPTY_FORM: TaskFormData = {
    title: '',
    category: 'Other',
    time: '08:00',
    days: [true, true, true, true, true, true, true],
    active: true,
};

function TaskModal({
    visible,
    initial,
    onSave,
    onDelete,
    onClose,
}: Readonly<{
    visible: boolean;
    initial?: Task | null;
    onSave: (t: TaskFormData) => void;
    onDelete?: () => void;
    onClose: () => void;
}>) {
    const { isDark } = useTheme();
    const C = getColors(isDark);
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
                    : { ...EMPTY_FORM, days: [true, true, true, true, true, true, true] },
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
            <SafeAreaView style={[s.modalSafe, { backgroundColor: C.bg }]}>
                <View
                    style={[
                        s.modalHeader,
                        { borderBottomColor: C.border, backgroundColor: C.card },
                    ]}
                >
                    <TouchableOpacity onPress={onClose}>
                        <Text style={[s.modalCancel, { color: C.sub }]}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[s.modalTitle, { color: C.text }]}>
                        {initial ? 'Edit Task' : 'New Task'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (form.title.trim()) onSave(form);
                        }}
                    >
                        <Text style={[s.modalSave, { color: C.blue }]}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={[s.modalBody, { backgroundColor: C.bg }]}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[s.fieldLabel, { color: C.sub }]}>Task Name</Text>
                    <TextInput
                        style={[
                            s.textInput,
                            { backgroundColor: C.card, borderColor: C.border, color: C.text },
                        ]}
                        value={form.title}
                        onChangeText={(t) => setForm({ ...form, title: t })}
                        placeholder="e.g. Morning Run"
                        placeholderTextColor={C.sub}
                    />

                    <Text style={[s.fieldLabel, { color: C.sub }]}>Time</Text>
                    <TextInput
                        style={[
                            s.textInput,
                            { backgroundColor: C.card, borderColor: C.border, color: C.text },
                        ]}
                        value={form.time}
                        onChangeText={(t) => setForm({ ...form, time: t })}
                        placeholder="HH:MM"
                        placeholderTextColor={C.sub}
                    />

                    <Text style={[s.fieldLabel, { color: C.sub }]}>Category</Text>
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
                                    { borderColor: C.border, backgroundColor: C.card },
                                    form.category === cat && {
                                        backgroundColor: CATEGORY_COLORS[cat],
                                        borderColor: CATEGORY_COLORS[cat],
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        s.catOptionText,
                                        { color: C.text },
                                        form.category === cat && { color: '#fff' },
                                    ]}
                                >
                                    {CATEGORY_ICONS[cat]} {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={[s.fieldLabel, { color: C.sub }]}>Active Days</Text>
                    <DayToggle days={form.days} onChange={toggleDay} C={C} />

                    <View style={s.switchRow}>
                        <Text style={[s.fieldLabel, { color: C.sub }]}>Active</Text>
                        <Switch
                            value={form.active}
                            onValueChange={(v) => setForm({ ...form, active: v })}
                            trackColor={{ false: C.border, true: C.green }}
                            thumbColor="#fff"
                        />
                    </View>

                    {initial && onDelete && (
                        <TouchableOpacity style={s.deleteBtn} onPress={onDelete}>
                            <Text style={[s.deleteBtnText, { color: C.red }]}>🗑 Delete Task</Text>
                        </TouchableOpacity>
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

// TasksTab

type Props = Readonly<{
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}>;

export default function TasksTab({ tasks, setTasks }: Props) {
    const { isDark } = useTheme();
    const C = getColors(isDark);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Done'>('All');
    const [modalVisible, setModalVisible] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);

    const todayTasks = tasks.filter((t) => t.active && t.days[todayIdx]);
    const pending = todayTasks.filter((t) => !t.completedToday && !t.skippedToday);
    const done = todayTasks.filter((t) => t.completedToday || t.skippedToday);
    const filtered = filter === 'All' ? todayTasks : filter === 'Pending' ? pending : done;

    const toggleComplete = (id: string) =>
        setTasks((ts) =>
            ts.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          completedToday: !t.completedToday,
                          skippedToday: t.completedToday ? t.skippedToday : false,
                          streakCount: !t.completedToday
                              ? t.streakCount + 1
                              : Math.max(0, t.streakCount - 1),
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
                          skippedToday: !t.skippedToday,
                          completedToday: t.skippedToday ? t.completedToday : false,
                      }
                    : t,
            ),
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
        <View style={[s.container, { backgroundColor: C.bg }]}>
            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={[s.dateText, { color: C.sub }]}>
                        {today.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                    <Text style={[s.titleText, { color: C.text }]}>Today&apos;s Tasks</Text>
                </View>
                <TouchableOpacity
                    style={[s.addBtn, { backgroundColor: C.blue, shadowColor: C.blue }]}
                    onPress={openNew}
                >
                    <Text style={s.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={[s.statsBar, { backgroundColor: C.card }]}>
                <View style={s.statItem}>
                    <Text style={[s.statNum, { color: C.text }]}>{todayTasks.length}</Text>
                    <Text style={[s.statLabel, { color: C.sub }]}>TOTAL</Text>
                </View>
                <View style={[s.statDivider, { backgroundColor: C.border }]} />
                <View style={s.statItem}>
                    <Text style={[s.statNum, { color: C.yellow }]}>{pending.length}</Text>
                    <Text style={[s.statLabel, { color: C.sub }]}>PENDING</Text>
                </View>
                <View style={[s.statDivider, { backgroundColor: C.border }]} />
                <View style={s.statItem}>
                    <Text style={[s.statNum, { color: C.green }]}>{done.length}</Text>
                    <Text style={[s.statLabel, { color: C.sub }]}>DONE</Text>
                </View>
            </View>

            {/* Filter */}
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
                        <Text
                            style={[
                                s.filterTabText,
                                { color: C.sub },
                                filter === f && { color: '#fff' },
                            ]}
                        >
                            {f}{' '}
                            {f === 'All'
                                ? `(${todayTasks.length})`
                                : f === 'Pending'
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
                            style={[s.taskCard, { backgroundColor: C.card }]}
                            onPress={() => openEdit(task)}
                            activeOpacity={0.8}
                        >
                            <View style={[s.taskAccent, { backgroundColor: catColor }]} />
                            <View style={s.taskInfo}>
                                <Text
                                    style={[
                                        s.taskTitle,
                                        { color: C.text },
                                        (isDone || isSkipped) && {
                                            color: C.sub,
                                            textDecorationLine: 'line-through',
                                        },
                                    ]}
                                >
                                    {task.title}
                                </Text>
                                <View style={s.taskMeta}>
                                    <Text style={[s.taskTime, { color: C.sub }]}>{task.time}</Text>
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
                                    <TouchableOpacity
                                        style={s.completedBadge}
                                        onPress={() => toggleComplete(task.id)}
                                    >
                                        <Text style={s.completedText}>Done</Text>
                                        <Text style={[s.undoHint, { color: C.sub }]}>
                                            tap to undo
                                        </Text>
                                    </TouchableOpacity>
                                ) : isSkipped ? (
                                    <TouchableOpacity
                                        style={[s.completedBadge, s.skippedBadge]}
                                        onPress={() => toggleSkip(task.id)}
                                    >
                                        <Text style={[s.completedText, s.skippedText]}>
                                            Skipped
                                        </Text>
                                        <Text style={[s.undoHint, { color: C.sub }]}>
                                            tap to undo
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={s.actionBtns}>
                                        <TouchableOpacity
                                            style={[s.skipBtn, { borderColor: C.border }]}
                                            onPress={() => toggleSkip(task.id)}
                                        >
                                            <Text style={[s.skipBtnText, { color: C.sub }]}>
                                                Skip
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[s.doneBtn, { backgroundColor: C.blue }]}
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

// Styles

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
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    statsBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
    statDivider: { width: 1 },
    filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 8 },
    filterTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    filterTabText: { fontSize: 13, fontWeight: '600' },
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
    },
    taskAccent: { width: 4, height: 48, borderRadius: 2, marginRight: 12 },
    taskInfo: { flex: 1 },
    taskTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    taskTime: { fontSize: 12 },
    streakBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    streakText: { fontSize: 11, color: '#92400E', fontWeight: '700' },
    taskActions: { alignItems: 'flex-end' },
    actionBtns: { gap: 6 },
    skipBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    skipBtnText: { fontSize: 12, fontWeight: '600' },
    doneBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    doneBtnText: { fontSize: 12, color: '#fff', fontWeight: '700' },
    completedBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        alignItems: 'center',
    },
    skippedBadge: { backgroundColor: '#FEF9C3' },
    completedText: { fontSize: 12, color: '#166534', fontWeight: '700' },
    skippedText: { color: '#A16207' },
    undoHint: { fontSize: 9, marginTop: 2 },
    pill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    pillText: { fontSize: 10, fontWeight: '700' },
    // Modal
    modalSafe: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalCancel: { fontSize: 16 },
    modalTitle: { fontSize: 17, fontWeight: '700' },
    modalSave: { fontSize: 16, fontWeight: '700' },
    modalBody: { flex: 1, padding: 20 },
    fieldLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 4 },
    textInput: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, marginBottom: 16 },
    dayRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    dayBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    dayBtnText: { fontSize: 13, fontWeight: '600' },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    catOption: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    catOptionText: { fontSize: 13, fontWeight: '600' },
    deleteBtn: {
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    deleteBtnText: { fontWeight: '700', fontSize: 15 },
});
