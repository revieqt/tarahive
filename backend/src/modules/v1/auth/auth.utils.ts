import redis from '../../../config/redis';
import jwt from 'jsonwebtoken';
import { IUser } from './auth.model';

const VERIFICATION_CODE_EXPIRATION = 30 * 60; // 30 minutes in seconds
const VERIFICATION_CODE_PREFIX = 'verification_code:';
const TWO_FA_CODE_PREFIX = '2fa_code:';
const PASSWORD_RESET_CODE_PREFIX = 'password_reset_code:';

export const generateAccessToken = (user: IUser, app: string): string => {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  const userId = (user._id as any).toString();
  const accessToken = jwt.sign({ 
    id: userId, 
    userId: userId, 
    email: user.email,
    app: app
  },
    secretKey,
    { expiresIn: '1h' } // 1 hour
  );
  return accessToken;
}

export const generateRefreshToken = (user: IUser): string => {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  const userId = (user._id as any).toString();
  const refreshToken = jwt.sign(
    { id: userId, userId: userId },
    secretKey,
    { expiresIn: '14d' } // 14 days
  );
  return refreshToken;
}

/**
 * Generate a 6-digit verification code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
    console.log(`📝 Storing verification code with key: ${key}`);
    console.log(`   Code length: ${code.length} digits`);
    console.log(`   Expiration: ${VERIFICATION_CODE_EXPIRATION} seconds (30 minutes)`);
    
    const result = await redis.setex(key, VERIFICATION_CODE_EXPIRATION, code);
    
    console.log(`✅ Verification code stored for ${email}`);
    console.log(`   Redis response:`, result);
    
    // Verify it was stored
    const verification = await redis.get(key);
    console.log(`   Verification - code exists in Redis:`, !!verification);
  } catch (error) {
    console.error(`❌ Error storing verification code for ${email}:`, error);
    throw error;
  }
};

/**
 * Store 2FA code in Redis
 * @param email - User email
 * @param code - 2FA code
 * @returns Promise that resolves when code is stored
 */
export const store2FACode = async (
  email: string,
  code: string
): Promise<void> => {
  try {
    const key = `${TWO_FA_CODE_PREFIX}${email}`;
    console.log(`📝 Storing 2FA code with key: ${key}`);
    console.log(`   Code length: ${code.length} digits`);
    console.log(`   Expiration: ${VERIFICATION_CODE_EXPIRATION} seconds (30 minutes)`);
    
    const result = await redis.setex(key, VERIFICATION_CODE_EXPIRATION, code);
    
    console.log(`✅ 2FA code stored for ${email}`);
    console.log(`   Redis response:`, result);
    
    // Verify it was stored
    const verification = await redis.get(key);
    console.log(`   Verification - code exists in Redis:`, !!verification);
  } catch (error) {
    console.error(`❌ Error storing 2FA code for ${email}:`, error);
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
    const storedCode = await redis.get(key);

    if (!storedCode) {
      console.warn(`⚠️ No verification code found for ${email}`);
      return false;
    }

    if (storedCode !== code) {
      console.warn(`⚠️ Invalid verification code for ${email}`);
      return false;
    }

    // Delete the code after successful verification
    await redis.del(key);
    console.log(`✅ Verification code verified and deleted for ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error verifying code for ${email}:`, error);
    throw error;
  }
};

/**
 * Verify 2FA code against stored code in Redis
 * @param email - User email
 * @param code - Code provided by user
 * @returns Promise that resolves to true if code is valid
 */
export const verify2FACode = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const key = `${TWO_FA_CODE_PREFIX}${email}`;
    console.log(`🔍 Looking for 2FA code with key: ${key}`);
    
    const storedCode = await redis.get(key);
    console.log(`📦 Retrieved from Redis:`, {
      key,
      storedCodeExists: !!storedCode,
      storedCode: storedCode ? '(hidden)' : 'null',
      userProvidedCode: code,
      match: storedCode === code
    });

    if (!storedCode) {
      console.warn(`⚠️ No 2FA code found for ${email} (key: ${key})`);
      return false;
    }

    if (storedCode !== code) {
      console.warn(`⚠️ Invalid 2FA code for ${email}. Expected: ${storedCode.length} digits, got: ${code.length} digits`);
      return false;
    }

    // Delete the code after successful verification
    await redis.del(key);
    console.log(`✅ 2FA code verified and deleted for ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error verifying 2FA code for ${email}:`, error);
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