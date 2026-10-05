import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function useFavorites() {
  const favs = useLiveQuery(() => db.favorites.toArray(), [], []);
  const ids = new Set(favs.map((f) => f.exerciseId));
  const toggle = async (id: string) => {
    if (ids.has(id)) await db.favorites.delete(id);
    else await db.favorites.put({ exerciseId: id, createdAt: Date.now() });
  };
  return { ids, toggle, isFav: (id: string) => ids.has(id) };
}
