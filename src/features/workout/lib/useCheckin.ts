import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CheckIn } from '@/lib/db';
import { dateKey } from '@/lib/date';
import { readinessLevel, readinessScore, type Readiness } from './progression';

export const useTodayCheckin = () => useLiveQuery(async () => (await db.checkins.get(dateKey())) ?? null, []);

export async function saveCheckin(r: Readiness): Promise<CheckIn> {
  const c: CheckIn = { date: dateKey(), ...r, score: readinessScore(r), updatedAt: Date.now() };
  await db.checkins.put(c);
  return c;
}
export const levelOf = (c?: CheckIn | null) => (c ? readinessLevel(c.score) : null);
