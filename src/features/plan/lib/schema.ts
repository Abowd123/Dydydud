import { z } from 'zod';

export const basicsSchema = z.object({
  gender: z.enum(['male', 'female']),
  age: z.number().int().min(14).max(80),
  heightCm: z.number().min(130).max(230),
  weightKg: z.number().min(35).max(250)
});
export const goalSchema = z.object({ goal: z.enum(['cut', 'bulk', 'fitness', 'strength']) });
export const levelSchema = z.object({
  level: z.enum(['beginner', 'novice', 'intermediate']),
  sessionMinutes: z.union([z.literal(45), z.literal(60), z.literal(75), z.literal(90)])
});
export const daysSchema = z.object({
  trainingDays: z.array(z.number().int().min(0).max(6)).min(2).max(6),
  equipment: z.enum(['gym', 'dumbbells', 'home'])
});
export const healthSchema = z.object({
  injuries: z.array(z.enum(['knee', 'back', 'shoulder'])),
  diet: z.enum(['normal', 'vegetarian', 'lowBudget', 'lactoseFree'])
});

export const STEP_SCHEMAS = [basicsSchema, goalSchema, levelSchema, daysSchema, healthSchema] as const;
export const profileSchema = basicsSchema.merge(goalSchema).merge(levelSchema).merge(daysSchema).merge(healthSchema);
export type ProfileForm = z.infer<typeof profileSchema>;
