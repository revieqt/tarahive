import { Router } from "express";
import { getMe, getUser, updateVisibilityController } from "./user.controller";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { rateLimiter } from "../../../middleware/rateLimitMiddleware";

const router = Router();

router.get("/me", rateLimiter('MODERATE'), authMiddleware, getMe);
router.get("/:id", rateLimiter('MODERATE'), authMiddleware, getUser);
router.patch("/update-visibility", rateLimiter('MODERATE'), authMiddleware, updateVisibilityController);

export default router;
