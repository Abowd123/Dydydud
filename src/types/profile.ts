export type Gender = 'male' | 'female';
export type Goal = 'cut' | 'bulk' | 'fitness' | 'strength';
export type Level = 'beginner' | 'novice' | 'intermediate';
export type EquipmentAccess = 'gym' | 'dumbbells' | 'home';
export type Injury = 'knee' | 'back' | 'shoulder';
export type Diet = 'normal' | 'vegetarian' | 'lowBudget' | 'lactoseFree';
/** 0 = الأحد ... 6 = السبت (نفس Date.getDay) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Profile {
  id: 'me';
  name?: string;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  level: Level;
  sessionMinutes: 45 | 60 | 75 | 90;
  trainingDays: Weekday[];
  equipment: EquipmentAccess;
  injuries: Injury[];
  diet: Diet;
  updatedAt: number;
}
