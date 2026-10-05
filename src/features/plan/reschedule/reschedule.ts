import type { DayKey, Program, WeekSlot } from '@/types/program';
import type { Weekday } from '@/types/profile';

/**
 * "فاتك يوم؟ ولا يهمك"
 * نحافظ على تسلسل الحصص (Push ثم Pull ثم Legs...) بدل ما نربطها بيوم ثابت.
 * أي حصة فاتت تنتقل لأقرب يوم متاح، بشرط ما نتمرن أكثر من يومين ورا بعض،
 * واللي ما تلحق هالأسبوع نتركها بهدوء بدون إحساس بالذنب.
 */

export const MAX_CONSECUTIVE = 2;
export const COMEBACK_AFTER_DAYS = 10;

export interface DoneSession { date: string; dayKey: DayKey }

export interface PlannedDay {
  date: string;
  weekday: Weekday;
  slot: WeekSlot; // الخطة الأصلية
  /** وش نسوي فعلاً هاليوم */
  dayKey: DayKey | null;
  done: boolean;
  /** نقلناها من يوم ثاني */
  movedFrom?: Weekday;
}

export interface WeekPlan {
  weekStart: string;
  days: PlannedDay[]; // 7 أيام من بداية الأسبوع
  today: PlannedDay;
  /** حصص فاتت ونقلناها */
  moved: { dayKey: DayKey; from: Weekday; to: Weekday }[];
  /** حصص ما تلحق هالأسبوع */
  dropped: { dayKey: DayKey; from: Weekday }[];
  /** رجعة بعد غياب: خفف الأوزان */
  comeback: boolean;
  daysSinceLast: number | null;
}

const DAY = 86400000;
const pad = (n: number) => String(n).padStart(2, '0');
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** بداية الأسبوع (السبت افتراضياً مثل الخليج) */
export function startOfWeek(d: Date, weekStart: Weekday = 6): Date {
  const diff = (d.getDay() - weekStart + 7) % 7;
  return addDays(d, -diff);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / DAY);
}

export function planWeek(program: Pick<Program, 'week'>, history: DoneSession[], now: Date, weekStart: Weekday = 6, enabled = true): WeekPlan {
  const start = startOfWeek(now, weekStart);
  const todayKey = toKey(now);
  const slotOf = (wd: Weekday) => program.week.find((w) => w.weekday === wd) ?? ({ weekday: wd, type: 'rest' } as WeekSlot);

  const days: PlannedDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const wd = d.getDay() as Weekday;
    const slot = slotOf(wd);
    const key = toKey(d);
    const doneHere = history.find((h) => h.date === key);
    return { date: key, weekday: wd, slot, dayKey: doneHere ? doneHere.dayKey : slot.type === 'train' ? slot.dayKey : null, done: !!doneHere };
  });
  const ti = days.findIndex((d) => d.date === todayKey);

  // الرجعة بعد غياب
  const past = history.filter((h) => h.date < todayKey).sort((a, b) => (a.date < b.date ? 1 : -1));
  const daysSinceLast = past.length ? daysBetween(past[0].date, todayKey) : null;
  const comeback = daysSinceLast !== null && daysSinceLast >= COMEBACK_AFTER_DAYS && !days[ti].done;

  const base: WeekPlan = { weekStart: toKey(start), days, today: days[ti], moved: [], dropped: [], comeback, daysSinceLast };
  if (!enabled) return base;

  // الحصص اللي انعملت هالأسبوع (أي يوم) تشطب من القائمة بالترتيب
  const doneKeys = days.filter((d) => d.done).map((d) => d.dayKey as DayKey);
  const consume = (k: DayKey) => { const i = doneKeys.indexOf(k); if (i >= 0) { doneKeys.splice(i, 1); return true; } return false; };

  // اللي فاتت: أيام تمرين قبل اليوم وما انعملت حصتها
  const missed: { dayKey: DayKey; from: Weekday }[] = [];
  for (let i = 0; i < ti; i++) {
    const s = days[i].slot;
    if (s.type === 'train' && !consume(s.dayKey)) missed.push({ dayKey: s.dayKey, from: days[i].weekday });
  }
  if (!missed.length) return base;

  // الطابور: الفايت أولاً ثم المخطط من اليوم وطالع (عشان التسلسل يبقى نفسه)
  const upcoming: { dayKey: DayKey; from: Weekday }[] = [];
  for (let i = ti; i < 7; i++) {
    const s = days[i].slot;
    if (days[i].done) continue;
    if (s.type === 'train' && !consume(s.dayKey)) upcoming.push({ dayKey: s.dayKey, from: days[i].weekday });
  }
  const queue = [...missed, ...upcoming];

  // كم يوم متتالي تمرنا قبل اليوم
  let streak = 0;
  for (let i = ti - 1; i >= 0 && days[i].done; i--) streak++;

  // الأيام اللي راحت بدون تمرين تبقى فاضية
  const out = days.map((d, i) => (i < ti && !d.done ? { ...d, dayKey: null } : { ...d }));
  for (let i = ti; i < 7; i++) {
    if (out[i].done) { streak++; continue; }
    out[i].dayKey = null;
    const canTrain = streak < MAX_CONSECUTIVE;
    // يوم تمرين أصلي، أو يوم راحة/كارديو بس لو عندنا تأخير
    const behind = queue.length > upcomingSlotsLeft(days, i);
    const isTrainSlot = days[i].slot.type === 'train';
    if (queue.length && canTrain && (isTrainSlot || behind)) {
      const next = queue.shift()!;
      out[i].dayKey = next.dayKey;
      if (next.from !== out[i].weekday) out[i].movedFrom = next.from;
      streak++;
    } else streak = 0;
  }

  const moved = out.filter((d) => d.movedFrom !== undefined && missed.some((m) => m.from === d.movedFrom)).map((d) => ({ dayKey: d.dayKey as DayKey, from: d.movedFrom as Weekday, to: d.weekday }));
  return { ...base, days: out, today: out[ti], moved, dropped: queue };
}

/** كم يوم تمرين أصلي باقي من i لآخر الأسبوع */
function upcomingSlotsLeft(days: PlannedDay[], from: number) {
  let n = 0;
  for (let i = from; i < 7; i++) if (days[i].slot.type === 'train' && !days[i].done) n++;
  return n;
}
