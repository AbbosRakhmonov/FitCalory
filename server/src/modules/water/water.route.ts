import { Router } from "express";
import * as controller from "./water.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/:date", controller.getLog);
router.post("/", controller.addEntry);

export default router;
