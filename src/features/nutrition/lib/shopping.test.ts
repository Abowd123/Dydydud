import { describe, expect, it } from 'vitest';
import { buildShoppingList, formatGrams } from './shopping';
import { generateDay } from './generator';
import { getFood } from './foods';

const daily = { kcal: 2200, protein: 160, carbs: 230, fat: 60 };

describe('shopping list', () => {
  it('aggregates 7 days into grouped items', () => {
    const groups = buildShoppingList(daily, 'normal', [], new Date(2026, 10, 1));
    expect(groups.length).toBeGreaterThan(3);
    groups.forEach((g) => g.items.forEach((i) => expect(getFood(i.foodId)!.category).toBe(g.category)));
  });
  it('uses saved plans when present', () => {
    const meals = generateDay(daily, 'normal', '2026-11-01').map((m) => ({ ...m, items: [{ foodId: 'salmon', servings: 10 }] }));
    const groups = buildShoppingList(daily, 'normal', [{ date: '2026-11-01', meals, profileVersion: 0, createdAt: 0 }], new Date(2026, 10, 1), 1);
    expect(groups).toHaveLength(1);
    expect(groups[0].items[0].grams).toBe(4000);
  });
  it('formats grams', () => {
    expect(formatGrams(1500, 'en')).toBe('1.5 kg');
    expect(formatGrams(450, 'ar')).toBe('450 جم');
  });
});
