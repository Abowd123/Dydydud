import type { Equipment } from '@/types/exercise';
import type { EquipmentAccess, Goal, Level, Profile, Weekday } from '@/types/profile';
import type { DayKey, PlannedExercise, Program, WeekSlot, WorkoutDay } from '@/types/program';
import { getExercise } from '@/features/exercises/lib/repository';
import { CONTRAINDICATED, DAY_TEMPLATES, SLOTS, splitFor } from './templates';

export const EQUIPMENT_ACCESS: Record<EquipmentAccess, Equipment[]> = {
  gym: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
  dumbbells: ['dumbbell', 'bodyweight'],
  home: ['bodyweight']
};

const MAX_EXERCISES: Record<number, number> = { 45: 5, 60: 6, 75: 7, 90: 7 };
const WARMUP_MIN = 8;

type PlanInput = Pick<Profile, 'goal' | 'level' | 'equipment' | 'injuries' | 'trainingDays' | 'sessionMinutes'>;

function prescribe(exerciseId: string, goal: Goal, level: Level): PlannedExercise {
  const e = getExercise(exerciseId)!;
  let { sets, reps, restSec } = e.defaults;
  const compound = e.mechanic === 'compound';
  if (level === 'beginner') sets = Math.min(sets, 3);
  if (goal === 'strength' && compound && !/[^\d-]/.test(reps)) {
    reps = '4-6';
    restSec = Math.max(restSec, 150);
    sets = Math.max(sets, level === 'beginner' ? 3 : 4);
  }
  if (goal === 'cut' && !compound) restSec = Math.min(restSec, 45);
  if (goal === 'fitness') restSec = Math.min(restSec, 90);
  return { exerciseId, sets, reps, restSec };
}

export function estimateMinutes(list: PlannedExercise[]): number {
  const secs = list.reduce((sum, x) => sum + x.sets * (45 + x.restSec), 0);
  return Math.round(secs / 60) + WARMUP_MIN;
}

export function buildDay(key: DayKey, input: PlanInput): WorkoutDay {
  const allowed = new Set(EQUIPMENT_ACCESS[input.equipment]);
  const banned = new Set(input.injuries.flatMap((i) => CONTRAINDICATED[i] ?? []));
  const used = new Set<string>();
  const tpl = DAY_TEMPLATES[key];
  const max = MAX_EXERCISES[input.sessionMinutes] ?? 6;
  const exercises: PlannedExercise[] = [];

  for (const slot of tpl.slots) {
    if (exercises.length >= max) break;
    const pick = SLOTS[slot].find((id) => {
      const e = getExercise(id);
      return e && allowed.has(e.equipment) && !banned.has(id) && !used.has(id);
    });
    if (!pick) continue;
    used.add(pick);
    exercises.push(prescribe(pick, input.goal, input.level));
  }

  // لو الوقت أطول من المدة، نشيل آخر تمرين عزل
  while (exercises.length > 3 && estimateMinutes(exercises) > input.sessionMinutes + 5) exercises.pop();

  return { key, focus: tpl.focus, exercises, estimatedMinutes: estimateMinutes(exercises) };
}

export function buildWeek(trainingDays: Weekday[], rotation: DayKey[], goal: Goal): WeekSlot[] {
  const train = [...trainingDays].sort((a, b) => a - b);
  const restDays = 7 - train.length;
  const cardioGoal = goal === 'cut' || goal === 'fitness';
  let r = 0;
  let restCount = 0;
  return ([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((weekday): WeekSlot => {
    if (train.includes(weekday)) return { weekday, type: 'train', dayKey: rotation[r++ % rotation.length] };
    restCount++;
    // التنشيف واللياقة: كارديو خفيف بالتناوب بأيام الراحة، وآخر يوم راحة دائماً راحة كاملة
    if (cardioGoal && restCount % 2 === 1 && restCount < restDays) {
      return { weekday, type: 'cardio', minutes: goal === 'cut' ? 30 : 25 };
    }
    return { weekday, type: 'rest' };
  });
}

export function generateProgram(input: PlanInput, weekNumber = 1): Program {
  const days = input.trainingDays.length;
  if (days < 2 || days > 6) throw new Error('trainingDays must be between 2 and 6');
  const { split, rotation } = splitFor(days);
  const unique = [...new Set(rotation)];
  const built = Object.fromEntries(unique.map((k) => [k, buildDay(k, input)])) as Program['days'];
  return { id: 'current', split, days: built, week: buildWeek(input.trainingDays, rotation, input.goal), createdAt: Date.now(), weekNumber };
}
