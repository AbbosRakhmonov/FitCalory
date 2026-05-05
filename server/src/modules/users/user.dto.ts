import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  age: z.number().min(10).max(120).optional(),
  gender: z.enum(["male", "female"]).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
  dailyCalorieGoal: z.number().min(500).max(10000).optional(),
  dailyWaterGoal: z.number().min(500).max(10000).optional(),
  dietMode: z.enum(["cut", "maintain", "bulk"]).optional(),
  avatar: z.string().url().optional(),
  allowedFoods: z.array(z.string().max(50)).max(50).optional(),
  restrictedFoods: z.array(z.string().max(50)).max(50).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
