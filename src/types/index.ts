import type { ImageSourcePropType } from 'react-native';

// Types

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
    earnedAt?: number; // ms timestamp for sorting
};

export type Friend = {
    id: string;
    name: string;
    tag: string;
    streakDays: number;
    needsNudge: boolean;
    photo?: ImageSourcePropType;
    tasks: number;
    bio?: string;
    profileId?: string;
    relationId?: string;
};

// Constants

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

// Static data

export const PROFILE_PHOTOS = {
    cplaue: require('../../assets/avatars/cplaue.png') as ImageSourcePropType,
    agalean: require('../../assets/avatars/agalean.png') as ImageSourcePropType,
};

export const INITIAL_TROPHIES: Trophy[] = [
    { id: 't1', title: 'First Step',       description: 'Complete your first habit',        icon: '👟',   type: 'bronze', earned: true,  earnedDate: 'Mar 1',  earnedAt: new Date('2026-03-01').getTime() },
    { id: 't2', title: 'Sennight Soldier', description: '7-day streak on any habit',        icon: '⚔️',  type: 'silver', earned: true,  earnedDate: 'Mar 8',  earnedAt: new Date('2026-03-08').getTime() },
    { id: 't3', title: 'Hydration Hero',   description: '10-day water streak',              icon: '💧',   type: 'streak', earned: true,  earnedDate: 'Mar 15', earnedAt: new Date('2026-03-15').getTime() },
    { id: 't4', title: 'Month Master',     description: '30-day streak on any habit',       icon: '🏆',   type: 'gold',   earned: false                                                                    },
    { id: 't5', title: 'Early Bird',       description: 'Complete a habit before 7am',      icon: '🌅',   type: 'silver', earned: false                                                                    },
    { id: 't6', title: 'Slacker',          description: 'Skipped all tasks in a day',       icon: '😴',   type: 'bad',    earned: false                                                                    },
    { id: 't7', title: 'Iron Will',        description: '100-day streak',                   icon: '💪',   type: 'gold',   earned: false                                                                    },
    { id: 't8', title: 'Streak Breaker',   description: 'Ended streak of at least 7 days',  icon: '⛓️‍💥', type: 'bad',    earned: false                                                                    },
    { id: 't9', title: 'Gone Missing',     description: 'Skipped all tasks in a week',   icon: '🫥', type: 'bad',    earned: false                                                                    },
    { id: 't10', title: 'Social Butterfly', description: 'Add 3 friends',                 icon: '🦋', type: 'silver', earned: false                       },
];

export const INITIAL_FRIENDS: Friend[] = [];

// Helpers

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
