import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { computeTargets } from '@/lib/calculations';
import type { Profile, Weekday } from '@/types/profile';
import type { Program } from '@/types/program';
import { generateProgram } from '../engine/engine';
import type { ProfileForm } from './schema';

export function usePlan() {
  // undefined = لسه يحمّل، null = ما فيه بيانات
  const profileQ = useLiveQuery(async () => (await db.profile.get('me')) ?? null, []);
  const programQ = useLiveQuery(async () => (await db.programs.get('current')) ?? null, []);
  const loading = profileQ === undefined || programQ === undefined;
  const profile = profileQ ?? undefined;
  const program = programQ ?? undefined;
  const targets = profile ? computeTargets(profile) : undefined;
  return { profile, program, targets, loading };
}

export async function saveProfileAndGenerate(form: ProfileForm): Promise<{ profile: Profile; program: Program }> {
  const profile: Profile = { id: 'me', ...form, trainingDays: form.trainingDays as Weekday[], updatedAt: Date.now() };
  const prev = await db.programs.get('current');
  const program = generateProgram(profile, prev?.weekNumber ?? 1);
  await db.transaction('rw', db.profile, db.programs, async () => {
    await db.profile.put(profile);
    await db.programs.put(program);
  });
  return { profile, program };
}

export async function regenerateProgram() {
  const profile = await db.profile.get('me');
  if (!profile) return;
  const prev = await db.programs.get('current');
  await db.programs.put(generateProgram(profile, prev?.weekNumber ?? 1));
}

/** ترتيب أيام الأسبوع للعرض: السبت أول بالعربي، الاثنين أول بالإنجليزي */
export const weekOrder = (lang: 'ar' | 'en'): Weekday[] => (lang === 'ar' ? [6, 0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0]);
export const todayWeekday = () => new Date().getDay() as Weekday;
