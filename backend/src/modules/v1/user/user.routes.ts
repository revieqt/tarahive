import { Router } from "express";
import { getMe, getUser } from "./user.controller";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { rateLimiter } from "../../../middleware/rateLimitMiddleware";

const router = Router();

router.get("/me", rateLimiter('MODERATE'), authMiddleware, getMe);
router.get("/:id", rateLimiter('MODERATE'), authMiddleware, getUser);

export default router;
