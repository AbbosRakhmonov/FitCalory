import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { error } from "../utils/response";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    error(res, "Unauthorized", 401);
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    error(res, "Invalid or expired token", 401);
  }
}
