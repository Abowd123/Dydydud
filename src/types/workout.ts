import type { DayKey } from './program';

export type Feel = 'easy' | 'good' | 'hard';

export interface SetLog {
  weight: number;
  reps: number; // أو ثواني للتمارين الزمنية
  done: boolean;
  feel?: Feel;
  at?: number;
}

export interface SessionExercise {
  exerciseId: string;
  target: { sets: number; reps: string; restSec: number };
  suggestedWeight: number | null;
  sets: SetLog[];
  swappedFrom?: string;
}

export type SessionStatus = 'active' | 'finished' | 'abandoned';
export type SessionPhase = 'warmup' | 'main' | 'cooldown';

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  dayKey: DayKey;
  status: SessionStatus;
  phase: SessionPhase;
  startedAt: number;
  finishedAt?: number;
  exercises: SessionExercise[];
  current: { ex: number; set: number };
  exerciseIds: string[]; // للفهرسة في Dexie
}

export interface PersonalRecord { exerciseId: string; est1RM: number; previous: number }

export interface SessionSummary {
  durationMin: number;
  setsDone: number;
  totalSets: number;
  reps: number;
  volumeKg: number;
  exercisesDone: number;
  prs: PersonalRecord[];
}
