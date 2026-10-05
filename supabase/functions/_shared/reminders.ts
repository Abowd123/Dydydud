/**
 * منطق التذكيرات (مشترك بين Edge Function والتطبيق، ومختبر).
 * يشتغل كل 15 دقيقة: يحسب الوقت المحلي للمستخدم ويقرر وش يرسل.
 */
export interface ReminderPrefs {
  tz: string; // مثال: Asia/Riyadh
  lang: 'ar' | 'en';
  workout_time: string | null; // "18:30"
  training_days: number[]; // 0 = الأحد
  water_interval_h: number | null; // كل كم ساعة
  water_start: number; // ساعة البداية 9
  water_end: number; // ساعة النهاية 21
  last_sent: Record<string, string>; // نوع ← آخر مفتاح انرسل
}

export interface Reminder { kind: 'workout' | 'water'; key: string; title: string; body: string; url: string }

export function localParts(now: Date, tz: string) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' });
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute), weekday };
}

const TEXT = {
  ar: { workoutT: 'وقت التمرين 💪', workoutB: 'حصتك اليوم جاهزة. يلا نكسر الرقم!', waterT: 'اشرب ماء 💧', waterB: 'كوب ماء الحين يفرق في أدائك.' },
  en: { workoutT: 'Workout time 💪', workoutB: "Today's session is ready. Let's go!", waterT: 'Drink water 💧', waterB: 'A glass now makes a difference.' }
};

/** windowMin: نافذة التشغيل (لازم تساوي فترة الـ cron) */
export function dueReminders(p: ReminderPrefs, now: Date, windowMin = 15): Reminder[] {
  const l = localParts(now, p.tz);
  const minutes = l.hour * 60 + l.minute;
  const t = TEXT[p.lang] ?? TEXT.ar;
  const out: Reminder[] = [];

  if (p.workout_time && p.training_days.includes(l.weekday)) {
    const [h, m] = p.workout_time.split(':').map(Number);
    const target = h * 60 + m;
    const key = `${l.date}`;
    if (minutes >= target && minutes < target + windowMin && p.last_sent.workout !== key)
      out.push({ kind: 'workout', key, title: t.workoutT, body: t.workoutB, url: '/workout' });
  }

  if (p.water_interval_h && l.hour >= p.water_start && l.hour < p.water_end) {
    const slot = Math.floor((l.hour - p.water_start) / p.water_interval_h);
    const slotHour = p.water_start + slot * p.water_interval_h;
    const key = `${l.date}T${slotHour}`;
    if (l.hour === slotHour && l.minute < windowMin && p.last_sent.water !== key)
      out.push({ kind: 'water', key, title: t.waterT, body: t.waterB, url: '/nutrition' });
  }
  return out;
}
