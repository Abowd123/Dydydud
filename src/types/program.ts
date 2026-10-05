import type { Muscle } from './exercise';
import type { Weekday } from './profile';

export type SplitType = 'fullBody' | 'upperLower' | 'pplUl' | 'ppl';
export type DayKey = 'fullBodyA' | 'fullBodyB' | 'upper' | 'lower' | 'push' | 'pull' | 'legs';

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  restSec: number;
}

export interface WorkoutDay {
  key: DayKey;
  focus: Muscle[];
  exercises: PlannedExercise[];
  estimatedMinutes: number;
}

export type WeekSlot =
  | { weekday: Weekday; type: 'train'; dayKey: DayKey }
  | { weekday: Weekday; type: 'cardio'; minutes: number }
  | { weekday: Weekday; type: 'rest' };

export interface Program {
  id: 'current';
  split: SplitType;
  days: Partial<Record<DayKey, WorkoutDay>>;
  week: WeekSlot[]; // 7 عناصر، مرتبة حسب weekday
  createdAt: number;
  weekNumber: number;
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  waterMl: number;
  waterTrainingMl: number;
  bmi: number;
}
