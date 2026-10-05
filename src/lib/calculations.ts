import type { Gender, Goal, Profile } from '@/types/profile';
import type { NutritionTargets } from '@/types/program';

/** معادلة Mifflin-St Jeor */
export function bmr(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/** معامل النشاط حسب عدد أيام التمرين في الأسبوع */
export function activityFactor(daysPerWeek: number): number {
  if (daysPerWeek <= 1) return 1.2;
  if (daysPerWeek <= 3) return 1.375;
  if (daysPerWeek <= 5) return 1.55;
  return 1.725;
}

export const tdee = (bmrValue: number, days: number) => Math.round(bmrValue * activityFactor(days));

const GOAL_ADJUST: Record<Goal, number> = { cut: -0.2, bulk: 0.1, fitness: 0, strength: 0.05 };
const PROTEIN_PER_KG: Record<Goal, number> = { cut: 2.2, bulk: 1.8, fitness: 1.6, strength: 2.0 };
export const MIN_CALORIES: Record<Gender, number> = { male: 1500, female: 1200 };

export function targetCalories(tdeeValue: number, goal: Goal, gender: Gender): number {
  const raw = tdeeValue * (1 + GOAL_ADJUST[goal]);
  return Math.max(MIN_CALORIES[gender], Math.round(raw / 10) * 10);
}

export function macros(calories: number, weightKg: number, goal: Goal) {
  const proteinG = Math.round(weightKg * PROTEIN_PER_KG[goal]);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  return { proteinG, fatG, carbsG };
}

/** الماء: 35 مل لكل كجم، + 500 مل أيام التمرين */
export function water(weightKg: number) {
  const base = Math.round((weightKg * 35) / 50) * 50;
  return { waterMl: base, waterTrainingMl: base + 500 };
}

export const bmi = (weightKg: number, heightCm: number) => Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10;

/** تقدير 1RM (Epley) */
export const oneRepMax = (weight: number, reps: number) => (reps <= 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10);

export function computeTargets(p: Pick<Profile, 'gender' | 'weightKg' | 'heightCm' | 'age' | 'goal' | 'trainingDays'>): NutritionTargets {
  const b = bmr(p.gender, p.weightKg, p.heightCm, p.age);
  const t = tdee(b, p.trainingDays.length);
  const calories = targetCalories(t, p.goal, p.gender);
  return { bmr: b, tdee: t, calories, ...macros(calories, p.weightKg, p.goal), ...water(p.weightKg), bmi: bmi(p.weightKg, p.heightCm) };
}

/** نسبة الدهون بطريقة البحرية الأمريكية (US Navy). ترجع null لو القياسات ناقصة أو غير منطقية */
export function navyBodyFat(gender: Gender, heightCm: number, waistCm?: number, neckCm?: number, hipCm?: number): number | null {
  if (!waistCm || !neckCm || (gender === 'female' && !hipCm)) return null;
  const diff = gender === 'male' ? waistCm - neckCm : waistCm + (hipCm ?? 0) - neckCm;
  if (diff <= 0) return null;
  const bf =
    gender === 'male'
      ? 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightCm)) - 450
      : 495 / (1.29579 - 0.35004 * Math.log10(diff) + 0.221 * Math.log10(heightCm)) - 450;
  return bf > 2 && bf < 60 ? Math.round(bf * 10) / 10 : null;
}
