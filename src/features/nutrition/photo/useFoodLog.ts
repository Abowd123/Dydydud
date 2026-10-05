import { useLiveQuery } from 'dexie-react-hooks';
import { db, type FoodLog } from '@/lib/db';
import { dateKey } from '@/lib/date';

export function useFoodLog(date = dateKey()) {
  const logs = useLiveQuery(() => db.foodLogs.where('date').equals(date).sortBy('at'), [date], [] as FoodLog[]);
  const total = logs.reduce((s, l) => ({ kcal: s.kcal + l.kcal, protein: s.protein + l.protein, carbs: s.carbs + l.carbs, fat: s.fat + l.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const add = (items: Omit<FoodLog, 'id' | 'date' | 'at'>[]) =>
    db.foodLogs.bulkAdd(items.map((i, k) => ({ ...i, id: crypto.randomUUID(), date, at: Date.now() + k })));
  const remove = (id: string) => db.foodLogs.delete(id);
  return { logs, total, add, remove };
}
