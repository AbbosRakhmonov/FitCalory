import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(500).json({ success: false, message: isDev ? err.message : "Internal server error" });
}
