import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

type Sensitivity = "LOW" | "MODERATE" | "HIGH" | "SENSITIVE";

const sensitivityConfig: Record<Sensitivity, { windowMs: number; max: number }> = {
  LOW: {
    windowMs: 60 * 1000,
    max: 20,
  },
  MODERATE: {
    windowMs: 60 * 1000,
    max: 10,
  },
  HIGH: {
    windowMs: 60 * 1000,
    max: 5,
  },
  SENSITIVE: {
    windowMs: 60 * 1000,
    max: 1,
  },
};

export const rateLimiter = (sensitivity: Sensitivity): RateLimitRequestHandler => {
  const config = sensitivityConfig[sensitivity];

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,

    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
      const user = (req as any).user;
      return user?.id ? `user:${user.id}` : `ip:${req.ip}`;
    },

    skip: (req) => {
      return req.path === "/health";
    },

    message: {
      error: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later.",
    },
  });
};