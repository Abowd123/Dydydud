import foodsData from '@/data/foods.json';
import type { Diet } from '@/types/profile';
import type { Food, Macros, MealItem } from '@/types/nutrition';

export const foods = foodsData as Food[];
const byId = new Map(foods.map((f) => [f.id, f]));
export const getFood = (id: string) => byId.get(id);

export function allowedForDiet(f: Food, diet: Diet): boolean {
  if (diet === 'vegetarian' && !f.vegetarian) return false;
  if (diet === 'lactoseFree' && f.lactose) return false;
  if (diet === 'lowBudget' && f.cost === 3) return false;
  return true;
}

export const ZERO: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

export function itemMacros({ foodId, servings }: MealItem): Macros {
  const f = getFood(foodId);
  if (!f) return ZERO;
  return { kcal: f.kcal * servings, protein: f.protein * servings, carbs: f.carbs * servings, fat: f.fat * servings };
}

export const sumMacros = (list: Macros[]): Macros =>
  list.reduce((a, m) => ({ kcal: a.kcal + m.kcal, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }), { ...ZERO });

export const mealMacros = (items: MealItem[]) => sumMacros(items.map(itemMacros));

export const roundMacros = (m: Macros): Macros => ({
  kcal: Math.round(m.kcal), protein: Math.round(m.protein), carbs: Math.round(m.carbs), fat: Math.round(m.fat)
});

/** "1.5 كوب" أو "2 × بيضة" */
export function formatServing(f: Food, servings: number, lang: 'ar' | 'en') {
  const n = Number.isInteger(servings) ? servings : servings.toFixed(1).replace('.0', '');
  return servings === 1 ? f.serving[lang] : `${n} × ${f.serving[lang]}`;
}
