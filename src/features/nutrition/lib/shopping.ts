import type { Diet } from '@/types/profile';
import type { Macros, MealPlan } from '@/types/nutrition';
import { addDays, dateKey } from '@/lib/date';
import { getFood } from './foods';
import { generateDay } from './generator';

export interface ShoppingItem { foodId: string; grams: number; servings: number }
export interface ShoppingGroup { category: string; items: ShoppingItem[] }

const CATEGORY_ORDER = ['meat', 'fish', 'eggs', 'legumes', 'dairy', 'grains', 'bread', 'veg-starch', 'veg', 'fruit', 'fats', 'nuts', 'seeds', 'sweet', 'snack', 'supplement'];

/** قائمة تسوق لـ 7 أيام: تستخدم الخطط المحفوظة لو موجودة، والباقي يتولد بنفس الطريقة */
export function buildShoppingList(daily: Macros, diet: Diet, saved: MealPlan[], start = new Date(), days = 7, mode: 'normal' | 'ramadan' = 'normal'): ShoppingGroup[] {
  const byDate = new Map(saved.map((p) => [p.date, p]));
  const totals = new Map<string, ShoppingItem>();
  for (let i = 0; i < days; i++) {
    const key = dateKey(addDays(start, i));
    const meals = byDate.get(key)?.meals ?? generateDay(daily, diet, key, mode);
    for (const m of meals) for (const it of m.items) {
      const f = getFood(it.foodId);
      if (!f) continue;
      const cur = totals.get(f.id) ?? { foodId: f.id, grams: 0, servings: 0 };
      cur.grams += f.grams * it.servings;
      cur.servings += it.servings;
      totals.set(f.id, cur);
    }
  }
  const groups = new Map<string, ShoppingItem[]>();
  for (const item of totals.values()) {
    const cat = getFood(item.foodId)!.category;
    groups.set(cat, [...(groups.get(cat) ?? []), { ...item, grams: Math.ceil(item.grams / 50) * 50 }]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
    .map(([category, items]) => ({ category, items: items.sort((a, b) => b.grams - a.grams) }));
}

export const formatGrams = (g: number, lang: 'ar' | 'en') =>
  g >= 1000 ? `${(g / 1000).toFixed(1).replace('.0', '')} ${lang === 'ar' ? 'كجم' : 'kg'}` : `${g} ${lang === 'ar' ? 'جم' : 'g'}`;
