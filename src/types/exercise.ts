export type Muscle =
  | 'chest' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'abs' | 'obliques'
  | 'traps' | 'lats' | 'upperBack' | 'lowerBack' | 'glutes' | 'quads' | 'hamstrings' | 'adductors' | 'calves';

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';
export type Difficulty = 1 | 2 | 3;

export interface Exercise {
  id: string;
  name: { ar: string; en: string };
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipment: Equipment;
  difficulty: Difficulty;
  mechanic: 'compound' | 'isolation';
  defaults: { sets: number; reps: string; restSec: number };
  steps: string[];
  mistakes: string[];
  breathing: string;
  alternatives: string[];
  media: { video: string; videoMp4: string; poster: string; thumb: string };
}

export const MUSCLES: Muscle[] = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'traps',
  'lats', 'upperBack', 'lowerBack', 'glutes', 'quads', 'hamstrings', 'adductors', 'calves'
];
export const EQUIPMENT: Equipment[] = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'];
