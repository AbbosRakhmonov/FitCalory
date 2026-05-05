export interface UserInterface {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  dietMode: "cut" | "maintain" | "bulk";
  allowedFoods: string[];
  restrictedFoods: string[];
  createdAt: string;
}
