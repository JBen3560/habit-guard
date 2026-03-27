import { Task, Category, CATEGORY_COLORS } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const genId = () => Math.random().toString(36).slice(2);

// All habits scheduled every day by default; override `days` per-entry if needed.
const EVERY_DAY: boolean[] = [true, true, true, true, true, true, true];
const WEEKDAYS:  boolean[] = [false, true, true, true, true, true, false];
const WEEKENDS:  boolean[] = [true, false, false, false, false, false, true];

function makeTask(
    overrides: Partial<Task> & Pick<Task, 'title' | 'category' | 'time'> & { streakCount?: number },
): Task {
    return {
        id: genId(),
        days: EVERY_DAY,
        active: true,
        streakCount: 0,
        completedToday: false,
        skippedToday: false,
        ...overrides,
    };
}

// ─── Initial Tasks ────────────────────────────────────────────────────────────

export const INITIAL_TASKS: Task[] = [
    // Medication
    makeTask({ title: 'Morning Medication',   category: 'Medication',   time: '08:00', streakCount: 14 }),
    makeTask({ title: 'Evening Medication',   category: 'Medication',   time: '21:00', streakCount: 12 }),
    makeTask({ title: 'Vitamins',             category: 'Medication',   time: '08:00', streakCount: 7  }),

    // Exercise
    makeTask({ title: 'Morning Walk',         category: 'Exercise',     time: '07:30', streakCount: 4, days: WEEKDAYS }),
    makeTask({ title: 'Evening Walk',         category: 'Exercise',     time: '19:00', streakCount: 2, days: WEEKDAYS }),
    makeTask({ title: 'Stretch Break',        category: 'Exercise',     time: '11:00', streakCount: 3  }),
    makeTask({ title: 'Sunlight Exposure',    category: 'Exercise',     time: '10:00', streakCount: 5  }),
    makeTask({ title: 'Weekend Workout',      category: 'Exercise',     time: '09:00', streakCount: 1, days: WEEKENDS }),

    // Hydration
    makeTask({ title: 'Morning Water',        category: 'Hydration',    time: '07:00', streakCount: 21 }),
    makeTask({ title: 'Afternoon Water',      category: 'Hydration',    time: '14:00', streakCount: 13 }),
    makeTask({ title: 'Evening Water',        category: 'Hydration',    time: '20:00', streakCount: 9  }),

    // Nutrition
    makeTask({ title: 'Eat Breakfast',        category: 'Nutrition',    time: '08:30', streakCount: 6  }),
    makeTask({ title: 'Healthy Lunch',        category: 'Nutrition',    time: '12:30', streakCount: 4, days: WEEKDAYS }),
    makeTask({ title: 'No Late-Night Snacking', category: 'Nutrition',  time: '21:00', streakCount: 2  }),

    // Mindfulness
    makeTask({ title: 'Deep Breathing',       category: 'Mindfulness',  time: '09:00', streakCount: 5  }),
    makeTask({ title: 'Journal Entry',        category: 'Mindfulness',  time: '21:00', streakCount: 1  }),
    makeTask({ title: 'Gratitude Check-In',   category: 'Mindfulness',  time: '08:00', streakCount: 3  }),

    // Hygiene
    makeTask({ title: 'Brush Teeth (AM)',     category: 'Hygiene',      time: '07:15', streakCount: 30 }),
    makeTask({ title: 'Brush Teeth (PM)',     category: 'Hygiene',      time: '21:30', streakCount: 28 }),
    makeTask({ title: 'Shower',               category: 'Hygiene',      time: '07:00', streakCount: 18 }),
    makeTask({ title: 'Floss',                category: 'Hygiene',      time: '21:30', streakCount: 8  }),
    makeTask({ title: 'Skincare Routine',     category: 'Hygiene',      time: '22:00', streakCount: 5  }),

    // Sleep
    makeTask({ title: 'Wind Down — No Screens', category: 'Sleep',      time: '22:30', streakCount: 2  }),
    makeTask({ title: 'Consistent Bedtime',   category: 'Sleep',        time: '23:00', streakCount: 1  }),
    makeTask({ title: 'No Caffeine After 2PM', category: 'Sleep',       time: '14:00', streakCount: 4  }),
];

// ─── Category metadata (icon names are MaterialIcons) ─────────────────────────

export const CATEGORY_META: Record<Category, { icon: string; color: string }> = {
    Medication:   { icon: 'medication',        color: CATEGORY_COLORS.Medication  },
    Exercise:     { icon: 'fitness-center',    color: CATEGORY_COLORS.Exercise    },
    Hydration:    { icon: 'water-drop',        color: CATEGORY_COLORS.Hydration   },
    Nutrition:    { icon: 'restaurant',        color: CATEGORY_COLORS.Nutrition   },
    Mindfulness:  { icon: 'self-improvement',  color: CATEGORY_COLORS.Mindfulness },
    Hygiene:      { icon: 'clean-hands',       color: CATEGORY_COLORS.Hygiene     },
    Sleep:        { icon: 'bedtime',           color: CATEGORY_COLORS.Sleep       },
    Other:        { icon: 'star',              color: CATEGORY_COLORS.Other       },
};
