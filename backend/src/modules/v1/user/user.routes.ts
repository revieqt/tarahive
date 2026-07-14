import { Router } from "express";
import { getMe, getUser, updateUserSettingsController } from "./user.controller";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { rateLimiter } from "../../../middleware/rateLimitMiddleware";

const router = Router();

router.post("/update-settings", rateLimiter('MODERATE'), authMiddleware, updateUserSettingsController);
router.get("/me", rateLimiter('MODERATE'), authMiddleware, getMe);
router.get("/:id", rateLimiter('MODERATE'), authMiddleware, getUser);

export default router;
