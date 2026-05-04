import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { analyzeFoodImages } from "./ai.service";
import { success, error } from "../../utils/response";

export async function analyze(req: AuthRequest, res: Response, next: NextFunction) {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    error(res, "Kamida bitta rasm kerak", 400);
    return;
  }
  try {
    const note = typeof req.body.note === "string" ? req.body.note : undefined;
    const imagePaths = files.map((f) => f.path);
    const result = await analyzeFoodImages(imagePaths, note);
    const photo = files[0].filename;
    success(res, { ...result, photo });
  } catch (err) {
    next(err);
  }
}
