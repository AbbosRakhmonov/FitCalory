import { Meal } from "./meal.model";
import { CreateMealDto, UpdateMealDto } from "./meal.dto";

function computeTotals(foods: CreateMealDto["foods"]) {
  return foods.reduce(
    (acc, f) => ({
      totalCalories: acc.totalCalories + f.calories,
      totalProtein: acc.totalProtein + f.protein,
      totalCarbs: acc.totalCarbs + f.carbs,
      totalFat: acc.totalFat + f.fat,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );
}

export async function getMeals(userId: string, date?: string) {
  const query: Record<string, unknown> = { userId };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }
  return Meal.find(query).sort({ date: -1 });
}

export async function getMealById(userId: string, mealId: string) {
  const meal = await Meal.findOne({ _id: mealId, userId });
  if (!meal) throw new Error("Meal not found");
  return meal;
}

export async function createMeal(userId: string, dto: CreateMealDto) {
  const totals = computeTotals(dto.foods);
  return Meal.create({ userId, ...dto, ...totals, date: new Date(dto.date) });
}

export async function updateMeal(userId: string, mealId: string, dto: UpdateMealDto) {
  const totals = dto.foods ? computeTotals(dto.foods) : {};
  const meal = await Meal.findOneAndUpdate(
    { _id: mealId, userId },
    { ...dto, ...totals },
    { new: true, runValidators: true }
  );
  if (!meal) throw new Error("Meal not found");
  return meal;
}

export async function deleteMeal(userId: string, mealId: string) {
  const meal = await Meal.findOneAndDelete({ _id: mealId, userId });
  if (!meal) throw new Error("Meal not found");
}

export async function getDailyStats(userId: string, date: string) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const meals = await Meal.find({ userId, date: { $gte: start, $lte: end } });
  return meals.reduce(
    (acc, m) => ({
      totalCalories: acc.totalCalories + m.totalCalories,
      totalProtein: acc.totalProtein + m.totalProtein,
      totalCarbs: acc.totalCarbs + m.totalCarbs,
      totalFat: acc.totalFat + m.totalFat,
      mealsCount: acc.mealsCount + 1,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, mealsCount: 0 }
  );
}

export async function getWeeklyStats(userId: string, startDate: string) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const meals = await Meal.find({ userId, date: { $gte: start, $lte: end } });

  const days: Record<string, { calories: number; protein: number; carbs: number; fat: number }> =
    {};
  for (let i = 0; i <= 6; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days[d.toISOString().slice(0, 10)] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  meals.forEach((m) => {
    const key = m.date.toISOString().slice(0, 10);
    if (days[key]) {
      days[key].calories += m.totalCalories;
      days[key].protein += m.totalProtein;
      days[key].carbs += m.totalCarbs;
      days[key].fat += m.totalFat;
    }
  });

  return Object.entries(days).map(([date, stats]) => ({ date, ...stats }));
}
