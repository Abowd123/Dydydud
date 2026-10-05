import { z } from 'zod';
import { dishById, GULF_DISHES, type Dish } from './gulfDishes';

// ملاحظة: تعليمات النموذج في supabase/functions/food-vision (نفس قائمة الأكلات من _shared/gulfDishes.ts)

/* ---------------- تطبيع النص العربي ---------------- */
export const normalizeAr = (s: string) =>
  s.toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '') // تشكيل وتطويل
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/).filter(Boolean)
    .map((w) => (w.length > 3 && w.startsWith('ال') ? w.slice(2) : w))
    .join(' ');

/** يطابق اسم أكلة (من الذكاء الاصطناعي أو بحث المستخدم) مع قاعدتنا */
export function matchDish(name: string, dishes: Dish[] = GULF_DISHES): { dish: Dish; score: number } | null {
  const q = normalizeAr(name);
  if (!q) return null;
  const qTokens = new Set(q.split(' '));
  let best: { dish: Dish; score: number } | null = null;
  for (const d of dishes) {
    for (const cand of [d.name.ar, d.name.en, ...d.aliases]) {
      const c = normalizeAr(cand);
      if (!c) continue;
      let score: number;
      if (c === q) score = 1;
      else {
        const cTokens = c.split(' ');
        const hit = cTokens.filter((t) => qTokens.has(t)).length;
        score = hit / Math.max(cTokens.length, qTokens.size);
        if (score === 0 && (q.includes(c) || c.includes(q)) && Math.min(c.length, q.length) >= 3) score = 0.6;
      }
      if (!best || score > best.score) best = { dish: d, score };
    }
  }
  return best && best.score >= 0.5 ? best : null;
}

export const searchDishes = (q: string, lang: 'ar' | 'en' = 'ar') => {
  const n = normalizeAr(q);
  if (!n) return GULF_DISHES;
  return GULF_DISHES.filter((d) => [d.name.ar, d.name.en, ...d.aliases].some((x) => normalizeAr(x).includes(n)))
    .sort((a, b) => a.name[lang].localeCompare(b.name[lang]));
};

/* ---------------- الحصص ---------------- */
export const PORTIONS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;
export const snapPortion = (p: number) => PORTIONS.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a), 1 as number);

export interface Macros4 { kcal: number; protein: number; carbs: number; fat: number }
export const scaleDish = (d: Pick<Dish, 'kcal' | 'protein' | 'carbs' | 'fat'>, portion: number): Macros4 => ({
  kcal: Math.round(d.kcal * portion),
  protein: Math.round(d.protein * portion * 10) / 10,
  carbs: Math.round(d.carbs * portion * 10) / 10,
  fat: Math.round(d.fat * portion * 10) / 10
});

/* ---------------- رد نموذج الرؤية ---------------- */
const itemSchema = z.object({
  name: z.string().min(1).max(80),
  dishId: z.string().optional().nullable(),
  portion: z.number().min(0.1).max(4).default(1),
  confidence: z.number().min(0).max(1).default(0.5),
  // للأكلات اللي مو في قاعدتنا: تقدير النموذج للحصة كاملة
  kcal: z.number().min(0).max(3000).optional(),
  protein: z.number().min(0).max(300).optional(),
  carbs: z.number().min(0).max(400).optional(),
  fat: z.number().min(0).max(250).optional()
});
const responseSchema = z.object({ items: z.array(itemSchema).max(8), notFood: z.boolean().optional() });

export interface Recognized {
  name: string;
  dish: Dish | null; // null = تقدير من النموذج
  portion: number;
  confidence: number;
  macros: Macros4; // للحصة المختارة
}

/** يقرأ JSON حتى لو النموذج لفّه بـ ```json */
export function parseVision(raw: string): { items: Recognized[]; notFood: boolean } | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  let json: unknown;
  try { json = JSON.parse(m[0]); } catch { return null; }
  const r = responseSchema.safeParse(json);
  if (!r.success) return null;
  const items: Recognized[] = [];
  for (const it of r.data.items) {
    const dish = (it.dishId && dishById(it.dishId)) || matchDish(it.name)?.dish || null;
    const portion = snapPortion(it.portion);
    if (dish) items.push({ name: dish.name.ar, dish, portion, confidence: it.confidence, macros: scaleDish(dish, portion) });
    else if (it.kcal != null)
      items.push({ name: it.name, dish: null, portion: 1, confidence: Math.min(it.confidence, 0.6),
        macros: { kcal: Math.round(it.kcal), protein: it.protein ?? 0, carbs: it.carbs ?? 0, fat: it.fat ?? 0 } });
  }
  return { items, notFood: !!r.data.notFood };
}
