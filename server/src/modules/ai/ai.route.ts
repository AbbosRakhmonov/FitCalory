import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { upload } from "../../config/multer";
import { analyze } from "./ai.controller";

const router = Router();

router.post("/analyze", authenticate, upload.single("image"), analyze);

export default router;
