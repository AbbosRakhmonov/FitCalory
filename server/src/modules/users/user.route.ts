import { Router } from "express";
import * as controller from "./user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { updateProfileSchema } from "./user.dto";

const router = Router();

router.use(authenticate);
router.get("/me", controller.getMe);
router.put("/me", validate(updateProfileSchema), controller.updateMe);
router.get("/me/tdee", controller.getTDEE);

export default router;
