import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log('🔐 Auth middleware - Authorization header:', authHeader);
  console.log('🔐 Auth middleware - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('❌ Auth middleware - No token provided');
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET || "default_secret";
    const decoded = jwt.verify(token, secretKey);
    console.log('✅ Auth middleware - Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Auth middleware - Token verification failed:', err);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Invalid authorization header." });
  }

  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET || "default_secret";
    req.user = jwt.verify(token, secretKey) as AuthRequest["user"];
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
