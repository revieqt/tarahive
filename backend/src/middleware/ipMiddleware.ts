import { Request, Response, NextFunction } from "express";

interface IPRequest extends Request {
  clientIp?: string;
}

/**
 * Middleware to extract and normalize the actual client IP address
 * Handles IPv4, IPv6, and proxy scenarios
 */
export const ipMiddleware = (req: IPRequest, res: Response, next: NextFunction) => {
  try {
    // Try to get IP from common proxy headers first
    let clientIp =
      (req.headers["x-forwarded-for"] as string) ||
      (req.headers["cf-connecting-ip"] as string) ||
      (req.headers["x-real-ip"] as string) ||
      req.socket?.remoteAddress ||
      "Unknown";

    // Handle x-forwarded-for which can contain multiple IPs (client, proxy1, proxy2, etc.)
    if (typeof clientIp === "string" && clientIp.includes(",")) {
      clientIp = clientIp.split(",")[0].trim();
    }

    // Remove IPv6 mapping prefix (::ffff:) if present
    clientIp = clientIp.replace(/^::ffff:/, "");

    // Store the cleaned IP in the request object
    req.clientIp = clientIp;

    console.log(`📍 Client IP: ${req.clientIp}`);
    next();
  } catch (error) {
    console.error("Error extracting client IP:", error);
    req.clientIp = "Unknown";
    next();
  }
};
