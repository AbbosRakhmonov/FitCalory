import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { analyzeFoodImage } from "./ai.service";
import { success, error } from "../../utils/response";

export async function analyze(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.file) {
    error(res, "Image is required", 400);
    return;
  }
  try {
    const result = await analyzeFoodImage(req.file.path);
    success(res, result);
  } catch (err) {
    next(err);
  }
}
