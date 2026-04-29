import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as waterService from "./water.service";
import { success, error } from "../../utils/response";

export async function getLog(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const date = req.params.date || new Date().toISOString().slice(0, 10);
    const log = await waterService.getWaterLog(req.userId!, date);
    success(res, log);
  } catch (err) {
    next(err);
  }
}

export async function addEntry(req: AuthRequest, res: Response, next: NextFunction) {
  const { date, amount } = req.body;
  if (!amount || amount <= 0) {
    error(res, "Amount must be positive", 400);
    return;
  }
  try {
    const log = await waterService.addWaterEntry(
      req.userId!,
      date || new Date().toISOString().slice(0, 10),
      amount
    );
    success(res, log);
  } catch (err) {
    next(err);
  }
}
