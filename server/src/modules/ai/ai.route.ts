import { Router, RequestHandler } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { upload } from "../../config/multer";
import { analyze } from "./ai.controller";

const router = Router();

router.post("/analyze", authenticate, upload.array("images", 5) as RequestHandler, analyze);

export default router;
