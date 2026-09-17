import redis from '../../../config/redis';
import { compareHashedOTP, hashOTP } from './auth.utils';

const VERIFICATION_CODE_EXPIRATION = 30 * 60; // 30 minutes in seconds
const VERIFICATION_CODE_PREFIX = 'verification_code:';
const TWO_FA_CODE_PREFIX = '2fa_code:';
const PASSWORD_RESET_CODE_PREFIX = 'password_reset_code:';
const PENDING_REGISTRATION_PREFIX = 'pending_register:';

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
 * Store pending user registration data in Redis
 * @param email - User email
 * @param userData - User registration data (with hashed password)
 * @returns Promise that resolves when data is stored
 */
export const storePendingRegistration = async (
  email: string,
  userData: any
): Promise<void> => {
  try {
    const key = `${PENDING_REGISTRATION_PREFIX}${email}`;
    const jsonData = JSON.stringify(userData);

    console.log(`📝 Storing pending registration with key: ${key}`);
    console.log(`   Email: ${email}`);
    console.log(`   Expiration: ${VERIFICATION_CODE_EXPIRATION} seconds (30 minutes)`);

    const result = await redis.setex(
      key,
      VERIFICATION_CODE_EXPIRATION,
      jsonData
    );

    console.log(`✅ Pending registration stored for ${email}`);
    console.log(`   Redis response:`, result);
  } catch (error) {
    console.error(
      `❌ Error storing pending registration for ${email}:`,
      error
    );
    throw error;
  }
};

/**
 * Get pending user registration data from Redis
 * @param email - User email
 * @returns User registration data or null if not found
 */
export const getPendingRegistration = async (email: string): Promise<any | null> => {
  try {
    const key = `${PENDING_REGISTRATION_PREFIX}${email}`;
    const data = await redis.get(key);

    if (!data) {
      console.warn(`⚠️ No pending registration found for ${email}`);
      return null;
    }

    const userData = JSON.parse(data);
    console.log(`✅ Pending registration retrieved for ${email}`);
    return userData;
  } catch (error) {
    console.error(
      `❌ Error retrieving pending registration for ${email}:`,
      error
    );
    throw error;
  }
};

/**
 * Delete pending user registration data from Redis
 * @param email - User email
 * @returns Promise that resolves when entry is deleted
 */
export const deletePendingRegistration = async (email: string): Promise<void> => {
  try {
    const key = `${PENDING_REGISTRATION_PREFIX}${email}`;
    await redis.del(key);
    console.log(`✅ Pending registration deleted for ${email}`);
  } catch (error) {
    console.error(`❌ Error deleting pending registration for ${email}:`, error);
    throw error;
  }
};