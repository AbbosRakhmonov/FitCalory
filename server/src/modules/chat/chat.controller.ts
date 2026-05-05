import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getHistory, sendMessage } from "./chat.service";
import { chatHistorySchema, sendMessageSchema } from "./chat.dto";
import { success } from "../../utils/response";

export async function getChatHistory(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { before, limit } = chatHistorySchema.parse(req.query);
    const result = await getHistory(req.userId!, before, limit);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function sendChatMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { message } = sendMessageSchema.parse(req.body);
    const result = await sendMessage(req.userId!, message);
    success(res, result);
  } catch (err) {
    next(err);
  }
}
