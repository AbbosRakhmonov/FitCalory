import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { analyzeFoodImages, analyzeFoodText, AiAnalysisResult } from "./ai.service";
import { success, error } from "../../utils/response";

export async function analyze(req: AuthRequest, res: Response, next: NextFunction) {
  const files = req.files as Express.Multer.File[] | undefined;
  const note = typeof req.body.note === "string" ? req.body.note.trim() : "";

  if ((!files || files.length === 0) && !note) {
    error(res, "Rasm yoki izoh kerak", 400);
    return;
  }

  try {
    let result: AiAnalysisResult;
    let photo: string | undefined;

    if (files && files.length > 0) {
      const imagePaths = files.map((f) => f.path);
      result = await analyzeFoodImages(imagePaths, note || undefined);
      photo = files[0].filename;
    } else {
      result = await analyzeFoodText(note);
    }

    success(res, { ...result, photo });
  } catch (err) {
    next(err);
  }
}
