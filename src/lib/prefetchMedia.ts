import type { Program } from '@/types/program';
import { getExercise } from '@/features/exercises/lib/repository';

/**
 * يحمّل فيديوهات وصور تمارين الأسبوع مسبقاً في الكاش (نفس كاش Service Worker)،
 * عشان تشتغل بالجيم حتى لو النت ضعيف. يتجاهل وضع توفير البيانات.
 */
export async function prefetchWeekMedia(program: Program) {
  if (!('caches' in window) || !navigator.onLine) return;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return;
  const ids = new Set(Object.values(program.days).flatMap((d) => d?.exercises.map((x) => x.exerciseId) ?? []));
  const urls = [...ids].flatMap((id) => {
    const e = getExercise(id);
    return e ? [e.media.thumb, e.media.poster, e.media.video] : [];
  });
  const cache = await caches.open('media');
  await Promise.allSettled(
    urls.map(async (u) => {
      if (await cache.match(u)) return;
      const res = await fetch(u);
      if (res.ok) await cache.put(u, res);
    })
  );
}
