// ─── Types ────────────────────────────────────────────────────────────────────

export type Category =
    | 'Medication'
    | 'Exercise'
    | 'Hydration'
    | 'Nutrition'
    | 'Mindfulness'
    | 'Hygiene'
    | 'Sleep'
    | 'Other';

export type Task = {
    id: string;
    title: string;
    category: Category;
    time: string;
    days: boolean[]; // Sun–Sat
    active: boolean;
    streakCount: number;
    completedToday: boolean;
    skippedToday: boolean;
};

export type Trophy = {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'gold' | 'silver' | 'bronze' | 'bad' | 'streak';
    earned: boolean;
    earnedDate?: string;
};

export type Friend = {
    id: string;
    name: string;
    tag: string;
    streakDays: number;
    missedDays: number;
    avatar: string;
    tasks: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
    'Medication',
    'Exercise',
    'Hydration',
    'Nutrition',
    'Mindfulness',
    'Hygiene',
    'Sleep',
    'Other',
];

export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CATEGORY_COLORS: Record<Category, string> = {
    Medication:  '#3B82F6',
    Exercise:    '#10B981',
    Hydration:   '#06B6D4',
    Nutrition:   '#F59E0B',
    Mindfulness: '#EC4899',
    Hygiene:     '#A855F7',
    Sleep:       '#6366F1',
    Other:       '#6B7280',
};

// ─── Static data ──────────────────────────────────────────────────────────────

export const INITIAL_TROPHIES: Trophy[] = [
    { id: 't1', title: 'First Step',       description: 'Complete your first habit',     icon: '👟', type: 'bronze', earned: true,  earnedDate: 'Mar 1'  },
    { id: 't2', title: 'Sennight Soldier', description: '7-day streak on any habit',     icon: '⚔️', type: 'silver', earned: true,  earnedDate: 'Mar 8'  },
    { id: 't3', title: 'Hydration Hero',   description: '10-day water streak',           icon: '💧', type: 'streak', earned: true,  earnedDate: 'Mar 15' },
    { id: 't4', title: 'Month Master',     description: '30-day streak on any habit',    icon: '🏆', type: 'gold',   earned: false                       },
    { id: 't5', title: 'Early Bird',       description: 'Complete a habit before 7am',   icon: '🌅', type: 'silver', earned: false                       },
    { id: 't6', title: 'Slacker',          description: 'Skipped all tasks in a day',    icon: '😴', type: 'bad',    earned: false,                      },
    { id: 't7', title: 'Iron Will',        description: '100-day streak',                icon: '💪', type: 'gold',   earned: false                       },
    { id: 't8', title: 'Streak Breaker',   description: 'Ended streak of at least 7 days', icon: '⛓️‍💥', type: 'bad', earned: false,                       },
    { id: 't9', title: 'Gone Missing',     description: 'Skipped all tasks in a week',   icon: '🫥', type: 'bad',    earned: true, earnedDate: 'Mar 10'  },
    { id: 't10', title: 'Social Butterfly', description: 'Add 3 friends',                 icon: '🦋', type: 'silver', earned: false                       },
];

export const INITIAL_FRIENDS: Friend[] = [
    { id: 'f1', name: 'Doc Plaue',    tag: '@cplaue',  streakDays: 182, missedDays: 0, avatar: '👨', tasks: 10 },
    { id: 'f2', name: 'Anna Galeano', tag: '@agalean', streakDays: 91,  missedDays: 3, avatar: '👩', tasks: 5  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const today    = new Date();
export const todayIdx = today.getDay(); // 0 = Sunday

export const getColors = (isDark: boolean) => ({
    bg:     isDark ? '#111827' : '#F9FAFB',
    card:   isDark ? '#1F2937' : '#FFFFFF',
    text:   isDark ? '#F9FAFB' : '#111827',
    sub:    isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    blue:   '#3B82F6',
    green:  '#10B981',
    yellow: '#F59E0B',
    red:    '#EF4444',
});

export type Colors = ReturnType<typeof getColors>;
