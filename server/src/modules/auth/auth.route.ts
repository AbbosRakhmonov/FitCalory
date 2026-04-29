import { Router } from "express";
import * as controller from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { registerSchema, loginSchema, googleAuthSchema, refreshSchema } from "./auth.dto";

const router = Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/google", validate(googleAuthSchema), controller.googleAuth);
router.post("/refresh", validate(refreshSchema), controller.refresh);
router.post("/logout", authenticate, controller.logout);

export default router;
