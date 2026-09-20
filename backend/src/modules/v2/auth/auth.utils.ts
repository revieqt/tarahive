import crypto , { randomUUID } from "crypto";
import { usernameAdjectives } from "./auth.types";

const OTP_SECRET = process.env.OTP_SECRET;

if (!OTP_SECRET) throw new Error("OTP_SECRET environment variable is required.");


/**
 * Username Generator
 */
export function generateUsername(
  firstName: string,
): string {
  if (!firstName) throw new Error("firstName is required");
  if (!usernameAdjectives?.length) throw new Error("adjectives array cannot be empty");

  const randomAdjective =
    usernameAdjectives[Math.floor(Math.random() * usernameAdjectives.length)];

  const cleanFirstName = firstName.trim().toLowerCase();

  const uuidSuffix = randomUUID().split("-")[0];

  return `${randomAdjective}_${cleanFirstName}_${uuidSuffix}`;
}


/**
 * Generate a 6-digit verification code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



/**
 * Hash OTP using HMAC-SHA256 + secret pepper
 * @param otp - Raw OTP code
 * @returns Hashed OTP string
 */
export const hashOTP = (otp: string): string => {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(otp)
    .digest("hex");
};


/**
 * Compare raw OTP against hashed OTP
 * @param otp - Raw OTP provided by user
 * @param hashedOTP - Stored hashed OTP
 * @returns True if OTP matches
 */
export const compareHashedOTP = (
  otp: string,
  hashedOTP: string
): boolean => {
  const hashedInput = hashOTP(otp);

  return crypto.timingSafeEqual(
    Buffer.from(hashedInput, "hex"),
    Buffer.from(hashedOTP, "hex")
  );
};