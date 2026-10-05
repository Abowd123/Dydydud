import type { Muscle } from '@/types/exercise';
import type { DayKey, SplitType } from '@/types/program';

/** كل "خانة" في اليوم = نمط حركة، مع مرشحين بالترتيب (الأفضل أول). المحرك يختار أول تمرين متاح */
export const SLOTS = {
  squat: ['back-squat', 'leg-press', 'goblet-squat', 'bodyweight-squat'],
  hinge: ['romanian-deadlift', 'dumbbell-rdl', 'hip-thrust', 'glute-bridge', 'single-leg-rdl'],
  lunge: ['bulgarian-split-squat', 'walking-lunge', 'step-up', 'bodyweight-lunge', 'curtsy-lunge'],
  quadIso: ['leg-extension', 'goblet-squat', 'bodyweight-squat'],
  hamIso: ['leg-curl', 'seated-leg-curl', 'dumbbell-rdl', 'romanian-deadlift', 'single-leg-rdl', 'glute-bridge'],
  glute: ['hip-thrust', 'dumbbell-hip-thrust', 'glute-bridge', 'single-leg-glute-bridge'],
  calves: ['standing-calf-raise', 'seated-calf-raise', 'bodyweight-calf-raise'],
  hPush: ['barbell-bench-press', 'dumbbell-bench-press', 'chest-press-machine', 'push-up'],
  incline: ['incline-dumbbell-press', 'dumbbell-bench-press', 'push-up'],
  chestIso: ['cable-fly', 'pec-deck', 'dumbbell-fly', 'svend-press'],
  vPush: ['overhead-press', 'dumbbell-shoulder-press', 'machine-shoulder-press', 'pike-push-up'],
  lateral: ['lateral-raise', 'cable-lateral-raise'],
  rearDelt: ['face-pull', 'rear-delt-fly', 'reverse-pec-deck'],
  vPull: ['lat-pulldown', 'assisted-pull-up', 'pull-up', 'chin-up'],
  hPull: ['seated-cable-row', 'barbell-row', 'dumbbell-row', 'inverted-row', 'superman'],
  hPull2: ['dumbbell-row', 'chest-supported-row', 't-bar-row', 'seated-cable-row', 'inverted-row', 'bird-dog'],
  biceps: ['dumbbell-curl', 'barbell-curl', 'preacher-curl'],
  hammer: ['hammer-curl', 'dumbbell-curl'],
  triceps: ['triceps-pushdown', 'rope-pushdown', 'overhead-triceps-extension', 'diamond-push-up', 'bench-dip'],
  core: ['plank', 'cable-crunch', 'dead-bug', 'crunch'],
  core2: ['hanging-knee-raise', 'bicycle-crunch', 'russian-twist', 'crunch']
} satisfies Record<string, string[]>;

export type SlotKey = keyof typeof SLOTS;

export const DAY_TEMPLATES: Record<DayKey, { focus: Muscle[]; slots: SlotKey[] }> = {
  fullBodyA: { focus: ['quads', 'chest', 'upperBack', 'shoulders'], slots: ['squat', 'hPush', 'hPull', 'vPush', 'hamIso', 'biceps', 'core'] },
  fullBodyB: { focus: ['hamstrings', 'lats', 'chest', 'glutes'], slots: ['hinge', 'vPull', 'incline', 'lunge', 'lateral', 'triceps', 'core2'] },
  upper: { focus: ['chest', 'lats', 'shoulders', 'biceps', 'triceps'], slots: ['hPush', 'hPull', 'vPush', 'vPull', 'lateral', 'biceps', 'triceps'] },
  lower: { focus: ['quads', 'hamstrings', 'glutes', 'calves'], slots: ['squat', 'hinge', 'lunge', 'hamIso', 'quadIso', 'calves', 'core'] },
  push: { focus: ['chest', 'shoulders', 'triceps'], slots: ['hPush', 'incline', 'vPush', 'lateral', 'chestIso', 'triceps'] },
  pull: { focus: ['lats', 'upperBack', 'biceps'], slots: ['vPull', 'hPull', 'hPull2', 'rearDelt', 'biceps', 'hammer'] },
  legs: { focus: ['quads', 'hamstrings', 'glutes', 'calves'], slots: ['squat', 'hinge', 'lunge', 'quadIso', 'hamIso', 'calves', 'core2'] }
};

export function splitFor(days: number): { split: SplitType; rotation: DayKey[] } {
  if (days <= 3) return { split: 'fullBody', rotation: ['fullBodyA', 'fullBodyB'] };
  if (days === 4) return { split: 'upperLower', rotation: ['upper', 'lower'] };
  if (days === 5) return { split: 'pplUl', rotation: ['push', 'pull', 'legs', 'upper', 'lower'] };
  return { split: 'ppl', rotation: ['push', 'pull', 'legs'] };
}

/** تمارين ممنوعة أو غير مستحسنة حسب الإصابة */
export const CONTRAINDICATED: Record<string, string[]> = {
  knee: ['back-squat', 'front-squat', 'hack-squat', 'bulgarian-split-squat', 'walking-lunge', 'bodyweight-lunge', 'dumbbell-reverse-lunge', 'curtsy-lunge', 'lateral-lunge', 'step-up', 'leg-extension', 'jump-squat', 'wall-sit', 'assisted-pistol-squat', 'burpee'],
  back: ['deadlift', 'sumo-deadlift', 'rack-pull', 'good-morning', 'back-squat', 'front-squat', 'barbell-row', 'pendlay-row', 't-bar-row', 'romanian-deadlift', 'overhead-press', 'push-press'],
  shoulder: ['overhead-press', 'push-press', 'arnold-press', 'chest-dip', 'barbell-bench-press', 'incline-barbell-press', 'decline-bench-press', 'skull-crusher', 'bench-dip', 'pike-push-up', 'dumbbell-pullover', 'machine-dip']
};
