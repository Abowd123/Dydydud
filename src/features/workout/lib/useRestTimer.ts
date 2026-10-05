import { useCallback, useEffect, useRef, useState } from 'react';
import { cues } from './feedback';

/**
 * مؤقت راحة مبني على وقت النهاية (مو عدّاد)، فيبقى دقيق حتى لو الشاشة انقفلت أو التطبيق راح للخلفية.
 */
export function useRestTimer(onDone?: () => void) {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [now, setNow] = useState(Date.now());
  const lastBeep = useRef<number>(-1);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!endAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endAt]);

  const remaining = endAt ? Math.max(0, Math.ceil((endAt - now) / 1000)) : 0;

  useEffect(() => {
    if (!endAt) return;
    if (remaining <= 3 && remaining > 0 && lastBeep.current !== remaining) {
      lastBeep.current = remaining;
      cues.tick();
    }
    if (remaining === 0) {
      cues.done();
      setEndAt(null);
      doneRef.current?.();
    }
  }, [remaining, endAt]);

  const start = useCallback((sec: number) => {
    lastBeep.current = -1;
    setTotal(sec);
    setNow(Date.now());
    setEndAt(Date.now() + sec * 1000);
  }, []);
  const add = useCallback((sec: number) => {
    setEndAt((e) => (e ? Math.max(Date.now() + 1000, e + sec * 1000) : e));
    setTotal((t) => Math.max(1, t + sec));
  }, []);
  const skip = useCallback(() => setEndAt(null), []);

  return { running: endAt !== null, remaining, total, progress: total ? remaining / total : 0, start, add, skip };
}
