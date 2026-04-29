import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { success, error } from "../../utils/response";
import { AuthRequest } from "../../middleware/auth.middleware";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await authService.register(req.body);
    success(res, data, "Registered successfully", 201);
  } catch (err) {
    if (err instanceof Error && err.message === "Email already in use") {
      error(res, err.message, 409);
    } else {
      next(err);
    }
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await authService.login(req.body);
    success(res, data, "Logged in successfully");
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid credentials") {
      error(res, err.message, 401);
    } else {
      next(err);
    }
  }
}

export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await authService.googleAuth(req.body.credential);
    success(res, data, "Authenticated with Google");
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, _next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    success(res, tokens, "Token refreshed");
  } catch {
    error(res, "Invalid refresh token", 401);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.userId!);
    success(res, null, "Logged out");
  } catch (err) {
    next(err);
  }
}
