import mongoose from "mongoose";
import { ChatMessage } from "./chat.model";
import { User } from "../users/user.model";
import { Meal } from "../meals/meal.model";
import { chatWithFoodAI } from "../ai/ai.service";

export async function getHistory(userId: string, before?: string, limit = 20) {
  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };
  if (before) {
    query._id = { $lt: new mongoose.Types.ObjectId(before) };
  }
  const messages = await ChatMessage.find(query).sort({ _id: -1 }).limit(limit);
  return { messages, hasMore: messages.length === limit };
}

export async function sendMessage(userId: string, message: string) {
  const userMsg = await ChatMessage.create({
    userId: new mongoose.Types.ObjectId(userId),
    role: "user",
    content: message,
  });

  const user = await User.findById(userId).select(
    "name age weight height dailyCalorieGoal allowedFoods restrictedFoods"
  );
  if (!user) throw new Error("User not found");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const todayMeals = await Meal.find({
    userId: new mongoose.Types.ObjectId(userId),
    date: { $gte: todayStart, $lt: todayEnd },
  });
  const todayTotals = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.totalCalories,
      protein: acc.protein + m.totalProtein,
      carbs: acc.carbs + m.totalCarbs,
      fat: acc.fat + m.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const todayCalories = todayTotals.calories;

  const historyDocs = await ChatMessage.find({
    userId: new mongoose.Types.ObjectId(userId),
    _id: { $lt: userMsg._id },
  })
    .sort({ _id: -1 })
    .limit(10);

  const history = historyDocs.reverse().map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const weight = user.weight ?? 70;
  const proteinGoal = Math.round(weight * 2);
  const fatGoal = Math.round((user.dailyCalorieGoal * 0.25) / 9);
  const carbsGoal = Math.round((user.dailyCalorieGoal - proteinGoal * 4 - fatGoal * 9) / 4);

  const aiText = await chatWithFoodAI({
    userMessage: message,
    history,
    userContext: {
      name: user.name,
      age: user.age ?? 25,
      weight,
      height: user.height ?? 170,
      dailyCalorieGoal: user.dailyCalorieGoal,
      proteinGoal,
      carbsGoal,
      fatGoal,
      todayCalories,
      todayProtein: todayTotals.protein,
      todayCarbs: todayTotals.carbs,
      todayFat: todayTotals.fat,
      allowedFoods: user.allowedFoods ?? [],
      restrictedFoods: user.restrictedFoods ?? [],
    },
  });

  const aiMsg = await ChatMessage.create({
    userId: new mongoose.Types.ObjectId(userId),
    role: "assistant",
    content: aiText,
  });

  return { userMsg, aiMsg };
}
