export type FoodRole = 'protein' | 'carb' | 'fat' | 'veg' | 'fruit' | 'dish';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'iftar' | 'lateSnack' | 'suhoor';
export type MealMode = 'normal' | 'ramadan';
export type MealCode = 'b' | 'l' | 'd' | 's';

export interface Food {
  id: string;
  name: { ar: string; en: string };
  category: string;
  role: FoodRole;
  meals: MealCode[];
  serving: { ar: string; en: string };
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  step: number;
  min: number;
  max: number;
  vegetarian: boolean;
  lactose: boolean;
  cost: 1 | 2 | 3;
  generator: boolean;
  image: string;
}

export interface Macros { kcal: number; protein: number; carbs: number; fat: number }
export interface MealItem { foodId: string; servings: number }

export interface Meal {
  type: MealType;
  target: Macros;
  items: MealItem[];
  eaten: boolean;
  seed: number;
}

export interface MealPlan {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  profileVersion: number;
  createdAt: number;
  mode?: MealMode;
}

export interface WaterLog { id: string; date: string; ml: number; at: number }
