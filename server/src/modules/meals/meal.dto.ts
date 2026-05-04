import { z } from "zod";

const foodItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
});

export const createMealSchema = z.object({
  date: z.string().datetime().or(z.string().date()),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  note: z.string().max(500).optional(),
  foods: z.array(foodItemSchema).default([]),
  photo: z.string().optional(),
  aiAnalysis: z.string().optional(),
  isManual: z.boolean().default(false),
});

export const updateMealSchema = createMealSchema.partial();

export type CreateMealDto = z.infer<typeof createMealSchema>;
export type UpdateMealDto = z.infer<typeof updateMealSchema>;
