import exercisesData from '@/data/exercises.json';
import type { Equipment, Exercise, Muscle } from '@/types/exercise';

/** المصدر السريع (متزامن) للتمارين. Dexie يحفظ نفس البيانات للاستعلامات في المراحل الجاية */
export const exercises = exercisesData as Exercise[];
const byId = new Map(exercises.map((e) => [e.id, e]));
export const getExercise = (id: string) => byId.get(id);

export interface ExerciseFilters {
  query?: string;
  muscle?: Muscle | null;
  equipment?: Equipment | null;
  difficulty?: number | null;
  favoritesOnly?: boolean;
  favoriteIds?: Set<string>;
}

const normalize = (s: string) =>
  s.toLowerCase().replace(/[\u064B-\u0652]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();

export function filterExercises(list: Exercise[], f: ExerciseFilters): Exercise[] {
  const q = f.query ? normalize(f.query) : '';
  return list.filter((e) => {
    if (q && !normalize(`${e.name.ar} ${e.name.en}`).includes(q)) return false;
    if (f.muscle && !e.primaryMuscles.includes(f.muscle) && !e.secondaryMuscles.includes(f.muscle)) return false;
    if (f.equipment && e.equipment !== f.equipment) return false;
    if (f.difficulty && e.difficulty !== f.difficulty) return false;
    if (f.favoritesOnly && !f.favoriteIds?.has(e.id)) return false;
    return true;
  }).sort((a, b) => {
    // التمارين اللي العضلة أساسية فيها تطلع أول
    if (!f.muscle) return 0;
    return Number(b.primaryMuscles.includes(f.muscle)) - Number(a.primaryMuscles.includes(f.muscle));
  });
}
