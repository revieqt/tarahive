import bcrypt from "bcrypt";
import crypto , { randomUUID } from "crypto";
import { usernameAdjectives } from "./auth.types";

const SALT_ROUNDS = 10;
const OTP_SECRET = process.env.OTP_SECRET;

if (!OTP_SECRET) {
  throw new Error("OTP_SECRET environment variable is required.");
}

/**
 * Validate password requirements:
 * - At least 8 characters
 * - 1 uppercase letter
 * - 1 lowercase letter
 * - 1 number
 * - 1 special character
 * @throws Error with validation message if invalid
 */
export function validatePassword(password: string): void {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors: string[] = [];

  if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters`);
  if (!hasUppercase) errors.push("Password must contain at least 1 uppercase letter");
  if (!hasLowercase) errors.push("Password must contain at least 1 lowercase letter");
  if (!hasNumber) errors.push("Password must contain at least 1 number");
  if (!hasSpecialChar) errors.push("Password must contain at least 1 special character");
  if (errors.length > 0) throw new Error(errors.join(", "));
}

/**
 * Validate that user is 13 years old or above
 * @throws Error if user is under 13
 */
export function validateAge(birthDate: string): void {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  if (age < 13) throw new Error("You must be at least 13 years old to register");
}

/**
 * Hasher using bcrypt
 */
export async function hashPassword(toHash: string): Promise<string> {
  return bcrypt.hash(toHash, SALT_ROUNDS);
}

/**
 * Compare hash
 */
export async function comparePassword(toCompare: string, hash: string): Promise<boolean> {
  return bcrypt.compare(toCompare, hash);
}

/**
 * Generate a 6-digit verification code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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