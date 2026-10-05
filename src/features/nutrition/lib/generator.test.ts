import { describe, expect, it } from 'vitest';
import { foods, getFood, mealMacros, sumMacros } from './foods';
import { generateDay, swapMeal } from './generator';
import type { Diet } from '@/types/profile';

const diets: Diet[] = ['normal', 'vegetarian', 'lowBudget', 'lactoseFree'];
const targets = [
  { kcal: 1500, protein: 120, carbs: 150, fat: 42 },
  { kcal: 2240, protein: 176, carbs: 220, fat: 62 },
  { kcal: 2800, protein: 150, carbs: 340, fat: 78 },
  { kcal: 3300, protein: 160, carbs: 420, fat: 92 }
];
const dates = Array.from({ length: 14 }, (_, i) => `2026-11-${String(i + 1).padStart(2, '0')}`);

describe('foods db', () => {
  it('has 100+ foods with unique ids', () => {
    expect(foods.length).toBeGreaterThanOrEqual(100);
    expect(new Set(foods.map((f) => f.id)).size).toBe(foods.length);
  });
  it('macros are consistent with calories (±25%)', () => {
    foods.forEach((f) => {
      const calc = f.protein * 4 + f.carbs * 4 + f.fat * 9;
      expect(Math.abs(calc - f.kcal) / f.kcal).toBeLessThanOrEqual(0.25);
    });
  });
});

describe('meal generator', () => {
  it('daily calories within ±5% for all diets, targets and dates', () => {
    let worst = 0;
    for (const diet of diets) for (const t of targets) for (const d of dates) {
      const day = generateDay(t, diet, d);
      const total = sumMacros(day.map((m) => mealMacros(m.items)));
      worst = Math.max(worst, Math.abs(total.kcal - t.kcal) / t.kcal);
    }
    expect(worst).toBeLessThanOrEqual(0.05);
  });

  it('protein reaches at least 85% of target', () => {
    for (const diet of diets) for (const t of targets) for (const d of dates) {
      const total = sumMacros(generateDay(t, diet, d).map((m) => mealMacros(m.items)));
      expect(total.protein / t.protein).toBeGreaterThanOrEqual(0.85);
    }
  });

  it('respects diet restrictions', () => {
    for (const d of dates) {
      generateDay(targets[1], 'vegetarian', d).forEach((m) => m.items.forEach((i) => expect(getFood(i.foodId)!.vegetarian).toBe(true)));
      generateDay(targets[1], 'lactoseFree', d).forEach((m) => m.items.forEach((i) => expect(getFood(i.foodId)!.lactose).toBe(false)));
      generateDay(targets[1], 'lowBudget', d).forEach((m) => m.items.forEach((i) => expect(getFood(i.foodId)!.cost).toBeLessThanOrEqual(2)));
    }
  });

  it('is deterministic for the same date', () => {
    expect(generateDay(targets[1], 'normal', '2026-11-01')).toEqual(generateDay(targets[1], 'normal', '2026-11-01'));
  });

  it('swap returns different foods with similar calories (±12%)', () => {
    const day = generateDay(targets[1], 'normal', '2026-11-03');
    day.forEach((m) => {
      const s = swapMeal(m, 'normal', '2026-11-03', 1);
      expect(s.items.map((i) => i.foodId).sort()).not.toEqual(m.items.map((i) => i.foodId).sort());
      expect(Math.abs(mealMacros(s.items).kcal - m.target.kcal) / m.target.kcal).toBeLessThanOrEqual(0.12);
    });
  });

  it('ramadan mode: 3 meals, iftar starts with dates, calories within ±6%', () => {
    for (const diet of diets) for (const t of targets) for (const d of dates.slice(0, 7)) {
      const day = generateDay(t, diet, d, 'ramadan');
      expect(day.map((m) => m.type)).toEqual(['iftar', 'lateSnack', 'suhoor']);
      const total = sumMacros(day.map((m) => mealMacros(m.items)));
      expect(Math.abs(total.kcal - t.kcal) / t.kcal).toBeLessThanOrEqual(0.06);
    }
    expect(generateDay(targets[1], 'normal', '2027-02-10', 'ramadan')[0].items.some((i) => i.foodId === 'dates')).toBe(true);
  });
});
