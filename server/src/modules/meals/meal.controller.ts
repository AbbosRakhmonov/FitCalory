import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as mealService from "./meal.service";
import { success, error } from "../../utils/response";

export async function getMeals(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const meals = await mealService.getMeals(req.userId!, req.query.date as string);
    success(res, meals);
  } catch (err) {
    next(err);
  }
}

export async function getMeal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const meal = await mealService.getMealById(req.userId!, req.params.id);
    success(res, meal);
  } catch (err) {
    if (err instanceof Error && err.message === "Meal not found") {
      error(res, err.message, 404);
    } else {
      next(err);
    }
  }
}

export async function createMeal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const meal = await mealService.createMeal(req.userId!, req.body);
    success(res, meal, "Meal logged", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateMeal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const meal = await mealService.updateMeal(req.userId!, req.params.id, req.body);
    success(res, meal);
  } catch (err) {
    if (err instanceof Error && err.message === "Meal not found") {
      error(res, err.message, 404);
    } else {
      next(err);
    }
  }
}

export async function deleteMeal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await mealService.deleteMeal(req.userId!, req.params.id);
    success(res, null, "Meal deleted");
  } catch (err) {
    if (err instanceof Error && err.message === "Meal not found") {
      error(res, err.message, 404);
    } else {
      next(err);
    }
  }
}

export async function getDailyStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const stats = await mealService.getDailyStats(req.userId!, date);
    success(res, stats);
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const startDate =
      (req.query.startDate as string) || new Date().toISOString().slice(0, 10);
    const stats = await mealService.getWeeklyStats(req.userId!, startDate);
    success(res, stats);
  } catch (err) {
    next(err);
  }
}
