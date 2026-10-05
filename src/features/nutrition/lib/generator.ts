import type { Diet } from '@/types/profile';
import type { Food, FoodRole, Macros, Meal, MealCode, MealItem, MealMode, MealType } from '@/types/nutrition';
import { allowedForDiet, foods, getFood, mealMacros } from './foods';

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
/** رمضان: إفطار (يبدأ بتمر)، سناك بعد التراويح، سحور بطيء الهضم */
export const RAMADAN_ORDER: MealType[] = ['iftar', 'lateSnack', 'suhoor'];
export const orderFor = (mode: MealMode = 'normal') => (mode === 'ramadan' ? RAMADAN_ORDER : MEAL_ORDER);
const CODE: Record<MealType, MealCode> = { breakfast: 'b', lunch: 'l', dinner: 'd', snack: 's', iftar: 'l', lateSnack: 's', suhoor: 'b' };
export const MEAL_SHARE: Record<MealType, number> = { breakfast: 0.25, lunch: 0.35, snack: 0.15, dinner: 0.25, iftar: 0.45, lateSnack: 0.2, suhoor: 0.35 };

/** تركيبة كل وجبة: أدوار الأكل المطلوبة */
const TEMPLATES: Record<MealType, FoodRole[]> = {
  breakfast: ['protein', 'carb', 'fat', 'fruit'],
  lunch: ['protein', 'carb', 'veg', 'fat'],
  dinner: ['protein', 'carb', 'veg'],
  snack: ['protein', 'fruit', 'fat'],
  iftar: ['fruit', 'protein', 'carb', 'veg', 'fat'],
  lateSnack: ['protein', 'fruit', 'fat'],
  suhoor: ['protein', 'carb', 'fat', 'fruit']
};

/** أكلات مفضلة لكل وجبة رمضانية (التمر للإفطار، والنشويات البطيئة للسحور) */
const PREFERRED: Partial<Record<MealType, Partial<Record<FoodRole, string[]>>>> = {
  iftar: { fruit: ['dates'] },
  suhoor: { carb: ['oats', 'ww-arabic-bread', 'brown-toast', 'foul'], protein: ['egg', 'greek-yogurt', 'foul', 'cottage-cheese', 'labneh'] }
};

/** كثافة البروتين = نسبة سعرات البروتين من سعرات الأكلة */
const density = (f: Food) => (f.protein * 4) / Math.max(f.kcal, 1);

/** مولّد أرقام عشوائية ثابت (نفس البذرة = نفس الوجبة) */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hashSeed = (s: string) => [...s].reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0), 2166136261);

function candidates(role: FoodRole, meal: MealType, diet: Diet): Food[] {
  const code = CODE[meal];
  const strict = foods.filter((f) => f.generator && f.role === role && f.meals.includes(code) && allowedForDiet(f, diet));
  if (strict.length) return strict;
  return foods.filter((f) => f.generator && f.role === role && allowedForDiet(f, diet));
}

const options = (f: Food, optional: boolean) => {
  const out: number[] = optional ? [0] : [];
  for (let v = f.min; v <= f.max + 1e-9; v += f.step) out.push(Math.round(v * 10) / 10);
  return out;
};

/** خطأ نسبي موزون: السعرات أهم شي، بعدها البروتين */
function score(m: Macros, t: Macros) {
  const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(b, 1);
  const pShort = Math.max(0, (t.protein - m.protein) / Math.max(t.protein, 1));
  const pOver = Math.max(0, (m.protein - t.protein) / Math.max(t.protein, 1));
  return 5 * rel(m.kcal, t.kcal) + 3 * pShort + 0.4 * pOver + 0.5 * rel(m.carbs, t.carbs) + 0.5 * rel(m.fat, t.fat);
}

/** يدوّر على أفضل كميات (بحث شامل صغير) */
export function solvePortions(list: Food[], target: Macros, optional: boolean[] = []): MealItem[] {
  const opts = list.map((f, i) => options(f, !!optional[i]));
  let best: { s: number; servings: number[] } = { s: Infinity, servings: [] };
  const cur: number[] = [];
  const walk = (i: number, acc: Macros) => {
    if (i === list.length) {
      const s = score(acc, target);
      if (s < best.s) best = { s, servings: [...cur] };
      return;
    }
    const f = list[i];
    for (const v of opts[i]) {
      cur[i] = v;
      walk(i + 1, { kcal: acc.kcal + f.kcal * v, protein: acc.protein + f.protein * v, carbs: acc.carbs + f.carbs * v, fat: acc.fat + f.fat * v });
    }
  };
  walk(0, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  return list.map((f, i) => ({ foodId: f.id, servings: best.servings[i] })).filter((x) => x.servings > 0);
}

export function buildMeal(type: MealType, target: Macros, diet: Diet, seed: number): Meal {
  const rand = rng(seed);
  const picked: Food[] = [];
  for (const role of TEMPLATES[type]) {
    let pool = candidates(role, type, diet).filter((f) => !picked.some((p) => p.id === f.id));
    const pref = PREFERRED[type]?.[role];
    if (pref) {
      const p = pool.filter((f) => pref.includes(f.id));
      if (p.length) pool = p;
    }
    if (pool.length) picked.push(pool[Math.floor(rand() * pool.length)]);
  }
  // لو مصدر البروتين ضعيف (بقوليات مثلاً)، نضيف مصدر بروتين عالي الكثافة
  const main = picked.find((f) => f.role === 'protein');
  if (type !== 'snack' && (!main || density(main) < 0.4)) {
    const boost = candidates('protein', type, diet).filter((f) => density(f) >= 0.5 && !picked.includes(f));
    if (boost.length) picked.push(boost[Math.floor(rand() * boost.length)]);
  }
  // الدهون والفاكهة ومصدر البروتين الإضافي اختيارية: المحلّل يقدر يشيلها لو السعرات قليلة
  const optional = picked.map((f, i) => {
    if (type === 'iftar' && f.id === 'dates') return false; // التمر أساسي بالإفطار
    return f.role === 'fat' || f.role === 'fruit' || i >= TEMPLATES[type].length;
  });
  let items = solvePortions(picked, target, optional);
  // للسعرات العالية: لو ما وصلنا للهدف، نضيف نشويات أو دهون إضافية ونعيد الحل
  for (const role of ['carb', 'fat'] as const) {
    if (mealMacros(items).kcal >= target.kcal * 0.95) break;
    const extra = candidates(role, type, diet).filter((f) => !picked.includes(f));
    if (!extra.length) continue;
    picked.push(extra[Math.floor(rand() * extra.length)]);
    optional.push(true);
    items = solvePortions(picked, target, optional);
  }
  return { type, target, items, eaten: false, seed };
}

const scale = (m: Macros, k: number): Macros => ({ kcal: m.kcal * k, protein: m.protein * k, carbs: m.carbs * k, fat: m.fat * k });
const sub = (a: Macros, b: Macros): Macros => ({ kcal: a.kcal - b.kcal, protein: a.protein - b.protein, carbs: a.carbs - b.carbs, fat: a.fat - b.fat });

/** يبني يوم كامل. كل وجبة تعوّض فرق اللي قبلها عشان المجموع يطلع مضبوط */
export function generateDay(daily: Macros, diet: Diet, dateKey: string, mode: MealMode = 'normal'): Meal[] {
  let remaining = { ...daily };
  let shareLeft = 1;
  return orderFor(mode).map((type) => {
    const share = MEAL_SHARE[type];
    const ideal = scale(daily, share);
    const raw = scale(remaining, share / shareLeft);
    // نحصر الهدف بين نص وضعف الحصة الطبيعية عشان ما تطلع وجبة غريبة
    const clamp = (v: number, base: number) => Math.min(base * 1.6, Math.max(base * 0.5, v));
    const target: Macros = { kcal: clamp(raw.kcal, ideal.kcal), protein: clamp(raw.protein, ideal.protein), carbs: clamp(raw.carbs, ideal.carbs), fat: clamp(raw.fat, ideal.fat) };
    const meal = buildMeal(type, roundTarget(target), diet, hashSeed(`${dateKey}:${type}:0`));
    remaining = sub(remaining, mealMacros(meal.items));
    shareLeft -= share;
    return { ...meal, target: roundTarget(ideal) };
  });
}

/** يبدّل وجبة بوجبة ثانية بنفس الأهداف */
export function swapMeal(meal: Meal, diet: Diet, dateKey: string, attempt: number): Meal {
  const previous = new Set(meal.items.map((i) => i.foodId));
  for (let k = 0; k < 6; k++) {
    const seed = hashSeed(`${dateKey}:${meal.type}:${attempt + k}`);
    const next = buildMeal(meal.type, meal.target, diet, seed);
    const same = next.items.every((i) => previous.has(i.foodId));
    if (!same) return next;
  }
  return buildMeal(meal.type, meal.target, diet, hashSeed(`${dateKey}:${meal.type}:${attempt}:x`));
}

const roundTarget = (m: Macros): Macros => ({ kcal: Math.round(m.kcal), protein: Math.round(m.protein), carbs: Math.round(m.carbs), fat: Math.round(m.fat) });

export const getMealFoods = (m: Meal) => m.items.map((i) => ({ item: i, food: getFood(i.foodId)! })).filter((x) => x.food);
