import { describe, expect, it } from 'vitest';
import { activityFactor, bmi, bmr, computeTargets, macros, navyBodyFat, oneRepMax, targetCalories, tdee, water } from './calculations';

describe('calculations', () => {
  it('BMR Mifflin-St Jeor (male 80kg 180cm 25y = 1805)', () => {
    expect(bmr('male', 80, 180, 25)).toBe(1805);
  });
  it('BMR female (60kg 165cm 30y = 1320)', () => {
    expect(bmr('female', 60, 165, 30)).toBe(1320);
  });
  it('activity factors', () => {
    expect(activityFactor(3)).toBe(1.375);
    expect(activityFactor(4)).toBe(1.55);
    expect(activityFactor(6)).toBe(1.725);
  });
  it('TDEE', () => expect(tdee(1805, 4)).toBe(2798));
  it('cut = -20%, bulk = +10%', () => {
    expect(targetCalories(2800, 'cut', 'male')).toBe(2240);
    expect(targetCalories(2800, 'bulk', 'male')).toBe(3080);
    expect(targetCalories(2800, 'fitness', 'male')).toBe(2800);
  });
  it('never goes below safe minimum', () => {
    expect(targetCalories(1300, 'cut', 'female')).toBe(1200);
    expect(targetCalories(1600, 'cut', 'male')).toBe(1500);
  });
  it('macros add up to calories (±10 kcal)', () => {
    const m = macros(2400, 80, 'cut');
    expect(m.proteinG).toBe(176);
    expect(Math.abs(m.proteinG * 4 + m.fatG * 9 + m.carbsG * 4 - 2400)).toBeLessThanOrEqual(10);
  });
  it('water 35ml/kg', () => {
    expect(water(80)).toEqual({ waterMl: 2800, waterTrainingMl: 3300 });
  });
  it('BMI', () => expect(bmi(80, 180)).toBe(24.7));
  it('1RM Epley', () => expect(oneRepMax(100, 5)).toBe(116.7));
  it('computeTargets full pipeline', () => {
    const t = computeTargets({ gender: 'male', weightKg: 80, heightCm: 180, age: 25, goal: 'cut', trainingDays: [0, 2, 4, 6] });
    expect(t.bmr).toBe(1805);
    expect(t.tdee).toBe(2798);
    expect(t.calories).toBe(2240);
  });
  it('Navy body fat (male 180cm, waist 85, neck 38 ≈ 16.1%)', () => {
    expect(navyBodyFat('male', 180, 85, 38)).toBe(16.1);
  });
  it('Navy body fat needs hip for women', () => {
    expect(navyBodyFat('female', 165, 75, 33)).toBeNull();
    expect(navyBodyFat('female', 165, 75, 33, 98)).toBeGreaterThan(20);
  });
});
