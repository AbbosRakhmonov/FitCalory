import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const chatHistorySchema = z.object({
  before: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});
