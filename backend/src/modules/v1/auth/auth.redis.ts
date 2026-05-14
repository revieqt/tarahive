import redis from '../../../config/redis';
import { compareHashedOTP, hashOTP } from './auth.utils';

const VERIFICATION_CODE_EXPIRATION = 30 * 60; // 30 minutes in seconds
const VERIFICATION_CODE_PREFIX = 'verification_code:';
const VALIDATED_EMAIL_PREFIX = 'validated_';
const TWO_FA_CODE_PREFIX = '2fa_code:';
const PASSWORD_RESET_CODE_PREFIX = 'password_reset_code:';

/**
 * Store email verification code in Redis
 * @param email - User email
 * @param code - Verification code
 * @returns Promise that resolves when code is stored
 */
export const storeVerificationCode = async (
  email: string,
  code: string
): Promise<void> => {
  try {
    const key = `${VERIFICATION_CODE_PREFIX}${email}`;

    const existingCode = await redis.get(key);
    if (existingCode) {
      console.log(
        `🗑️ Existing verification code found for ${email}; deleting old entry before storing new code.`
      );

      await redis.del(key);
    }

    // Hash OTP before storing
    const hashedCode = await hashOTP(code);

    console.log(`📝 Storing verification code with key: ${key}`);
    console.log(`   Code length: ${code.length} digits`);
    console.log(
      `   Expiration: ${VERIFICATION_CODE_EXPIRATION} seconds (30 minutes)`
    );

    const result = await redis.setex(
      key,
      VERIFICATION_CODE_EXPIRATION,
      hashedCode
    );

    console.log(`✅ Verification code stored for ${email}`);
    console.log(`   Redis response:`, result);

    // Verify it was stored
    const verification = await redis.get(key);

    console.log(
      `   Verification - hashed code exists in Redis:`,
      !!verification
    );
  } catch (error) {
    console.error(
      `❌ Error storing verification code for ${email}:`,
      error
    );

    throw error;
  }
};

/**
 * Verify email verification code against stored code in Redis
 * @param email - User email
 * @param code - Code provided by user
 * @returns Promise that resolves to true if code is valid
 */
export const verifyVerificationCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const key = `${VERIFICATION_CODE_PREFIX}${email}`;

    const storedHashedCode = await redis.get(key);

    if (!storedHashedCode) {
      console.warn(`⚠️ No verification code found for ${email}`);
      return false;
    }

    // Compare raw code against hashed code
    const isValid = await compareHashedOTP(code, storedHashedCode);

    if (!isValid) {
      console.warn(`⚠️ Invalid verification code for ${email}`);
      return false;
    }

    // Delete code after successful verification
    await redis.del(key);

    console.log(
      `✅ Verification code verified and deleted for ${email}`
    );

    return true;
  } catch (error) {
    console.error(`❌ Error verifying code for ${email}:`, error);
    throw error;
  }
};

/**
 * Delete a verification code from Redis (useful for cleanup)
 * @param email - User email
 * @param type - Code type: 'verification' or '2fa'
 */
export const deleteCode = async (
  email: string,
  type: 'verification' | '2fa' = 'verification'
): Promise<void> => {
  try {
    const prefix = type === '2fa' ? TWO_FA_CODE_PREFIX : VERIFICATION_CODE_PREFIX;
    const key = `${prefix}${email}`;
    await redis.del(key);
    console.log(`✅ ${type} code deleted for ${email}`);
  } catch (error) {
    console.error(`❌ Error deleting ${type} code for ${email}:`, error);
    throw error;
  }
};

/**
 * Get remaining TTL (time to live) for a code in Redis
 * @param email - User email
 * @param type - Code type: 'verification' or '2fa'
 * @returns Remaining TTL in seconds, or -1 if key doesn't exist
 */
export const getCodeTTL = async (
  email: string,
  type: 'verification' | '2fa' = 'verification'
): Promise<number> => {
  try {
    const prefix = type === '2fa' ? TWO_FA_CODE_PREFIX : VERIFICATION_CODE_PREFIX;
    const key = `${prefix}${email}`;
    const ttl = await redis.ttl(key);
    return ttl;
  } catch (error) {
    console.error(`❌ Error getting TTL for ${type} code:`, error);
    throw error;
  }
};

/**
 * Store password reset code in Redis
 * @param email - User email
 * @param code - Reset code
 * @returns Promise that resolves when code is stored
 */
export const storePasswordResetCode = async (
  email: string,
  code: string
): Promise<void> => {
  try {
    const key = `${PASSWORD_RESET_CODE_PREFIX}${email}`;
    console.log(`📝 Storing password reset code with key: ${key}`);
    console.log(`   Code length: ${code.length} digits`);
    console.log(`   Expiration: ${VERIFICATION_CODE_EXPIRATION} seconds (30 minutes)`);
    
    const result = await redis.setex(key, VERIFICATION_CODE_EXPIRATION, code);
    
    console.log(`✅ Password reset code stored for ${email}`);
    console.log(`   Redis response:`, result);
    
    // Verify it was stored
    const verification = await redis.get(key);
    console.log(`   Verification - code exists in Redis:`, !!verification);
  } catch (error) {
    console.error(`❌ Error storing password reset code for ${email}:`, error);
    throw error;
  }
};

/**
 * Verify password reset code against stored code in Redis
 * @param email - User email
 * @param code - Code provided by user
 * @returns Promise that resolves to true if code is valid
 */
export const verifyPasswordResetCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const key = `${PASSWORD_RESET_CODE_PREFIX}${email}`;
    console.log(`🔍 Looking for password reset code with key: ${key}`);
    
    const storedCode = await redis.get(key);
    console.log(`📦 Retrieved from Redis:`, {
      key,
      storedCodeExists: !!storedCode,
      storedCode: storedCode ? '(hidden)' : 'null',
      userProvidedCode: code,
      match: storedCode === code
    });

    if (!storedCode) {
      console.warn(`⚠️ No password reset code found for ${email} (key: ${key})`);
      return false;
    }

    if (storedCode !== code) {
      console.warn(`⚠️ Invalid password reset code for ${email}. Expected: ${storedCode.length} digits, got: ${code.length} digits`);
      return false;
    }

    // Delete the code after successful verification
    await redis.del(key);
    console.log(`✅ Password reset code verified and deleted for ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error verifying password reset code for ${email}:`, error);
    throw error;
  }
};

/**
 * Mark email as validated after successful verification
 * @param email - User email
 * @returns Promise that resolves when email is marked as validated
 */
export const markEmailAsValidated = async (email: string): Promise<void> => {
  try {
    const key = `${VALIDATED_EMAIL_PREFIX}${email}`;
    console.log(`📝 Marking email as validated with key: ${key}`);
    console.log(`   Expiration: ${VERIFICATION_CODE_EXPIRATION} seconds (30 minutes)`);
    
    const result = await redis.setex(key, VERIFICATION_CODE_EXPIRATION, '1');
    
    console.log(`✅ Email marked as validated for ${email}`);
    console.log(`   Redis response:`, result);
  } catch (error) {
    console.error(`❌ Error marking email as validated for ${email}:`, error);
    throw error;
  }
};

/**
 * Check if email is validated
 * @param email - User email
 * @returns Promise that resolves to true if email is validated
 */
export const isEmailValidated = async (email: string): Promise<boolean> => {
  try {
    const key = `${VALIDATED_EMAIL_PREFIX}${email}`;
    const result = await redis.get(key);
    
    if (result) {
      console.log(`✅ Email is validated: ${email}`);
      return true;
    }
    
    console.warn(`⚠️ Email is not validated: ${email}`);
    return false;
  } catch (error) {
    console.error(`❌ Error checking if email is validated for ${email}:`, error);
    throw error;
  }
};

/**
 * Delete validated email entry (after successful registration)
 * @param email - User email
 * @returns Promise that resolves when entry is deleted
 */
export const deleteValidatedEmail = async (email: string): Promise<void> => {
  try {
    const key = `${VALIDATED_EMAIL_PREFIX}${email}`;
    await redis.del(key);
    console.log(`✅ Validated email entry deleted for ${email}`);
  } catch (error) {
    console.error(`❌ Error deleting validated email entry for ${email}:`, error);
    throw error;
  }
};