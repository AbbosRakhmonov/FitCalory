import { Router } from "express";
import * as controller from "./meal.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createMealSchema, updateMealSchema } from "./meal.dto";

const router = Router();

router.use(authenticate);

router.get("/stats/daily", controller.getDailyStats);
router.get("/stats/weekly", controller.getWeeklyStats);
router.get("/", controller.getMeals);
router.get("/:id", controller.getMeal);
router.post("/", validate(createMealSchema), controller.createMeal);
router.put("/:id", validate(updateMealSchema), controller.updateMeal);
router.delete("/:id", controller.deleteMeal);

export default router;
