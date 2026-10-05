import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { BodyMetric } from './stats';

export const useMetrics = () => useLiveQuery(() => db.bodyMetrics.orderBy('date').toArray(), [], [] as BodyMetric[]);
export const usePhotos = () => useLiveQuery(() => db.photos.orderBy('date').reverse().toArray(), [], []);

export async function saveMetric(m: Omit<BodyMetric, 'updatedAt'>) {
  const prev = await db.bodyMetrics.get(m.date);
  const clean = Object.fromEntries(Object.entries(m).filter(([, v]) => v !== undefined && v !== null && !Number.isNaN(v)));
  await db.bodyMetrics.put({ ...prev, ...clean, date: m.date, updatedAt: Date.now() } as BodyMetric);
}
export const deleteMetric = (date: string) => db.bodyMetrics.delete(date);
