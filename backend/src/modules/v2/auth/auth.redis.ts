import redis from '../../../config/redis';
import { compareHashedOTP, hashOTP } from './auth.utils';

const VERIFICATION_CODE_EXPIRATION = 30 * 60;

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
    const key = `${email}`;

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
    const key = `${email}`;

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
): Promise<void> => {
  try {
    const key = `${email}`;
    await redis.del(key);
    console.log(`✅ Code deleted for ${email}`);
  } catch (error) {
    console.error(`❌ Error deleting code for ${email}:`, error);
    throw error;
  }
};