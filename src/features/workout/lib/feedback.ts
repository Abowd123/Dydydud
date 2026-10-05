import { useSettings } from '@/store/settings';

let ctx: AudioContext | null = null;

/** لازم ينادى بعد ضغطة المستخدم (سياسة المتصفحات للصوت) */
export function unlockAudio() {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* بدون صوت */
  }
}

export function beep(freq = 880, ms = 140, volume = 0.25) {
  if (!useSettings.getState().sound || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(volume, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + ms / 1000 + 0.02);
}

export function vibrate(pattern: number | number[]) {
  if (useSettings.getState().vibrate && 'vibrate' in navigator) navigator.vibrate(pattern);
}

export const cues = {
  tick: () => beep(660, 90, 0.18),
  done: () => { beep(988, 160); setTimeout(() => beep(1318, 260), 170); vibrate([120, 60, 220]); },
  set: () => { beep(784, 90, 0.2); vibrate(40); },
  finish: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 180), i * 140)); vibrate([80, 40, 80, 40, 300]); }
};
