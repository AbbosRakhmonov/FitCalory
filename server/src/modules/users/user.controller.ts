import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as userService from "./user.service";
import { success, error } from "../../utils/response";

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.getProfile(req.userId!);
    success(res, user);
  } catch (err) {
    if (err instanceof Error && err.message === "User not found") {
      error(res, err.message, 404);
    } else {
      next(err);
    }
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.userId!, req.body);
    success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function getTDEE(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.getProfile(req.userId!);
    if (!user.weight || !user.height || !user.age) {
      error(res, "Complete your profile first (weight, height, age required)", 400);
      return;
    }
    const tdee = userService.calculateTDEE(
      user.weight,
      user.height,
      user.age,
      user.gender,
      user.activityLevel
    );
    success(res, { tdee });
  } catch (err) {
    next(err);
  }
}
