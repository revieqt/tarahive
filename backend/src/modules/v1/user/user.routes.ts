import { Router } from "express";
import { getMe } from "./user.controller";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { rateLimiter } from "../../../middleware/rateLimitMiddleware";

const router = Router();

router.get("/me", rateLimiter('MODERATE'),authMiddleware, getMe);

export default router;
