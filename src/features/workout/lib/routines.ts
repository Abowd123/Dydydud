export interface RoutineStep { id: string; sec: number; emoji: string }

/** إحماء عام 5 دقائق تقريباً */
export const WARMUP: RoutineStep[] = [
  { id: 'march', sec: 60, emoji: '🚶' },
  { id: 'jacks', sec: 40, emoji: '🤸' },
  { id: 'armCircles', sec: 30, emoji: '🔄' },
  { id: 'hipCircles', sec: 30, emoji: '⭕' },
  { id: 'bwSquats', sec: 40, emoji: '🦵' },
  { id: 'inchworm', sec: 40, emoji: '🐛' },
  { id: 'catCow', sec: 30, emoji: '🐈' }
];

/** تبريد وإطالات 4 دقائق تقريباً */
export const COOLDOWN: RoutineStep[] = [
  { id: 'walk', sec: 60, emoji: '🚶' },
  { id: 'quadStretch', sec: 30, emoji: '🦵' },
  { id: 'hamStretch', sec: 30, emoji: '🙇' },
  { id: 'chestStretch', sec: 30, emoji: '🫁' },
  { id: 'childPose', sec: 40, emoji: '🧘' },
  { id: 'breathing', sec: 30, emoji: '🌬️' }
];

export const routineMinutes = (r: RoutineStep[]) => Math.round(r.reduce((s, x) => s + x.sec, 0) / 60);
