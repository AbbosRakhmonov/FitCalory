export interface FoodItemInterface {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MealInterface {
  _id: string;
  userId: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  photo?: string;
  note?: string;
  foods: FoodItemInterface[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  aiAnalysis?: string;
  isManual: boolean;
  createdAt: string;
}

export interface DailyStatsInterface {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealsCount: number;
}

export interface WeeklyStatsDayInterface {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AiAnalysisInterface {
  foods: FoodItemInterface[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: "high" | "medium" | "low";
  notes: string;
}
