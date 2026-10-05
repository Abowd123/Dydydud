import { useEffect } from 'react';

/** يمنع الشاشة تطفي أثناء التمرين (لو المتصفح يدعم) */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        /* البطارية منخفضة أو ممنوع */
      }
    };
    void request();
    const onVis = () => document.visibilityState === 'visible' && void request();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      void lock?.release();
    };
  }, [active]);
}
