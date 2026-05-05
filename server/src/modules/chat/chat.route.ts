import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getChatHistory, sendChatMessage } from "./chat.controller";

const router = Router();

router.use(authenticate);
router.get("/", getChatHistory);
router.post("/", sendChatMessage);

export default router;
