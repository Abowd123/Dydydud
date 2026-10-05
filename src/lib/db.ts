import Dexie, { type Table } from 'dexie';
import type { Exercise } from '@/types/exercise';
import type { Profile } from '@/types/profile';
import type { Program } from '@/types/program';
import type { MealPlan, WaterLog } from '@/types/nutrition';
import type { WorkoutSession } from '@/types/workout';
import type { BodyMetric } from '@/features/progress/lib/stats';
import type { OutboxItem } from '@/lib/sync/merge';
import type { ChallengeState } from '@/features/challenges/challenges';
import exercisesData from '@/data/exercises.json';

export interface Favorite { exerciseId: string; createdAt: number }
export interface Meta { key: string; value: string }
/** أكل خارج الخطة (من صورة أو اختيار يدوي) */
export interface FoodLog {
  id: string;
  date: string;
  at: number;
  name: string;
  dishId?: string;
  portion: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'photo' | 'manual';
}

export interface ProgressPhoto {
  id: string;
  date: string;
  pose: 'front' | 'side' | 'back';
  blob?: Blob; // محلي فقط
  remotePath?: string; // لو انرفعت للسحابة
  width: number;
  height: number;
  updatedAt: number;
}
export interface OutboxRow extends OutboxItem { id: string }
export interface CheckIn { date: string; sleepH: number; energy: 1 | 2 | 3 | 4 | 5; soreness: 1 | 2 | 3 | 4 | 5; score: number; updatedAt: number }
export interface CoachMessage { id: string; role: 'user' | 'assistant'; content: string; at: number; source?: 'ai' | 'local' | 'safety'; actions?: { label: string; to?: string; action?: string }[] }

/** قاعدة البيانات المحلية (IndexedDB). تتوسع في المراحل الجاية: users, programs, logs... */
class GymMateDB extends Dexie {
  exercises!: Table<Exercise, string>;
  favorites!: Table<Favorite, string>;
  meta!: Table<Meta, string>;
  profile!: Table<Profile, string>;
  programs!: Table<Program, string>;
  mealPlans!: Table<MealPlan, string>;
  water!: Table<WaterLog, string>;
  bodyMetrics!: Table<BodyMetric, string>;
  photos!: Table<ProgressPhoto, string>;
  outbox!: Table<OutboxRow, string>;
  checkins!: Table<CheckIn, string>;
  challenges!: Table<ChallengeState, string>;
  coachMessages!: Table<CoachMessage, string>;
  sessions!: Table<WorkoutSession, string>;
  foodLogs!: Table<FoodLog, string>;

  constructor() {
    super('gymmate');
    this.version(1).stores({
      exercises: 'id, equipment, difficulty, *primaryMuscles, *secondaryMuscles',
      favorites: 'exerciseId, createdAt',
      meta: 'key'
    });
    // المرحلة 2: الملف الشخصي والخطة
    this.version(2).stores({ profile: 'id', programs: 'id' });
    // المرحلة 3: الوجبات والماء
    this.version(3).stores({ mealPlans: 'date', waterLogs: '++id, date' });
    // المرحلة 4: حصص التمرين
    this.version(4).stores({ sessions: 'id, date, status, startedAt, *exerciseIds' });
    // المرحلة 5: التقدم والصور والمزامنة. الماء صار بمفتاح UUID عشان ما يتعارض بين الأجهزة
    this.version(5)
      .stores({ water: 'id, date', bodyMetrics: 'date', photos: 'id, date', outbox: 'id, at' })
      .upgrade(async (tx) => {
        const old = await tx.table('waterLogs').toArray();
        await tx.table('water').bulkAdd(old.map((o: { date: string; ml: number; at: number }) => ({ id: crypto.randomUUID(), date: o.date, ml: o.ml, at: o.at })));
      });
    this.version(6).stores({ waterLogs: null });
    // المرحلة 6: الجاهزية، التحديات، محادثات المدرب (المحادثات محلية فقط)
    this.version(7).stores({ checkins: 'date', challenges: 'id', coachMessages: 'id, at' });
    // 2.1: صوّر وجبتك
    this.version(8).stores({ foodLogs: 'id, date' });
  }
}

export const db = new GymMateDB();

/** نسخة بيانات التمارين: غيّرها كل ما عدلت exercises.json عشان تنعاد التعبئة */
export const EXERCISES_VERSION = '1.2.0';

export async function seedDatabase() {
  const current = await db.meta.get('exercisesVersion');
  if (current?.value === EXERCISES_VERSION) return;
  await db.transaction('rw', db.exercises, db.meta, async () => {
    await db.exercises.clear();
    await db.exercises.bulkPut(exercisesData as Exercise[]);
    await db.meta.put({ key: 'exercisesVersion', value: EXERCISES_VERSION });
  });
}
