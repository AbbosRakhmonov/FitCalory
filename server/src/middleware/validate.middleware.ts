import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { error } from "../utils/response";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      error(res, result.error.errors[0].message, 422);
      return;
    }
    req.body = result.data;
    next();
  };
}
