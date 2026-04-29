import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

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

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }
  if (!hasUppercase) {
    errors.push("Password must contain at least 1 uppercase letter");
  }
  if (!hasLowercase) {
    errors.push("Password must contain at least 1 lowercase letter");
  }
  if (!hasNumber) {
    errors.push("Password must contain at least 1 number");
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least 1 special character");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }
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
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < 13) {
    throw new Error("You must be at least 13 years old to register");
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}