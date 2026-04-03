import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../auth/auth.model';
import { addSendVerificationEmailJob, addVerify2FAEmailJob, addSendPasswordResetEmailJob } from './auth.queue';
import {
  generateVerificationCode as generateCode,
  storeVerificationCode,
  store2FACode,
  verifyVerificationCode,
  verify2FACode,
  storePasswordResetCode,
  verifyPasswordResetCode,
} from '../../../utils/verificationCodeUtils';

interface RegisterUserData {
  fname: string;
  lname?: string;
  username: string;
  email: string;
  password: string;
  contactNumber?: string;
  bdate: Date;
  gender: string;
  type: string;
}

interface LoginResponse {
  user: Omit<IUser, 'password'>;
  accessToken: string;
  refreshToken: string;
}

const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];

export const generateAccessToken = (user: IUser): string => {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  const userId = (user._id as any).toString();
  const accessToken = jwt.sign(
    { id: userId, userId: userId, email: user.email },
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

export const loginUser = async (identifier: string, password: string): Promise<LoginResponse> => {
  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const secretKey = process.env.JWT_SECRET || 'default_secret';
    const userId = (user._id as any).toString();
    const accessToken = jwt.sign(
      { id: userId, userId: userId, email: user.email },
      secretKey,
      { expiresIn: '1h' } // 1 hour
    );
    
    const refreshToken = jwt.sign(
      { id: userId, userId: userId },
      secretKey,
      { expiresIn: '14d' } // 14 days
    );

    const userObject = user.toObject();

    return {
      user: userObject,
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw error;
  }
};

export const sendVerificationCode = async (email: string): Promise<string> => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const code = generateCode();

    // Store code in Redis with 30-minute expiration
    await storeVerificationCode(email, code);

    // Queue the email job to send the code
    await addSendVerificationEmailJob({
      email,
      code,
      is2FA: false,
    });

    console.log(`📧 Verification code generated and queued for ${email}`);
    return code;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

export const send2FACode = async (email: string): Promise<string> => {
  try {
    console.log(`📲 send2FACode called with email:`, email);
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const code = generateCode();
    console.log(`   Generated code: ${code.length} digits`);
    console.log(`   Storing in Redis with key: 2fa_code:${email}`);

    // Store 2FA code in Redis with 30-minute expiration
    await store2FACode(email, code);

    // Queue the 2FA email job to send the code
    await addVerify2FAEmailJob({
      email,
      code,
      is2FA: true,
    });

    console.log(`📧 2FA code generated and queued for ${email}`);
    return code;
  } catch (error) {
    console.error('Error sending 2FA code:', error);
    throw error;
  }
};

export const verifyUserEmail = async (email: string, code: string): Promise<void> => {
  try {
    // Verify the code against Redis
    const isValid = await verifyVerificationCode(email, code);

    if (!isValid) {
      throw new Error('Invalid or expired verification code');
    }

    // Find and update user status to active
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    // Update status to active
    user.status = 'active';
    await user.save();

    console.log(`✅ Email verified and user activated for ${email}`);
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};

export const verify2FA = async (email: string, code: string): Promise<boolean> => {
  try {
    console.log(`🔐 verify2FA called with email:`, email);
    console.log(`   Code to verify: ${code.length} digits`);
    console.log(`   Looking up key: 2fa_code:${email}`);
    
    // Verify the 2FA code against Redis
    const isValid = await verify2FACode(email, code);

    if (!isValid) {
      console.log(`❌ 2FA code verification failed for ${email}`);
      throw new Error('Invalid or expired 2FA code');
    }

    console.log(`✅ 2FA code verified for ${email}`);
    return true;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    throw error;
  }
};

export const sendPasswordResetCode = async (email: string): Promise<string> => {
  try {
    console.log(`🔑 sendPasswordResetCode called with email:`, email);
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const code = generateCode();
    console.log(`   Generated code: ${code.length} digits`);
    console.log(`   Storing in Redis with key: password_reset_code:${email}`);

    // Store password reset code in Redis with 30-minute expiration
    await storePasswordResetCode(email, code);

    // Queue the password reset email job to send the code
    await addSendPasswordResetEmailJob({
      email,
      code,
    });

    console.log(`📧 Password reset code generated and queued for ${email}`);
    return code;
  } catch (error) {
    console.error('Error sending password reset code:', error);
    throw error;
  }
};

export const verifyAndResetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
  try {
    console.log(`🔐 verifyAndResetPassword called with email:`, email);
    console.log(`   Code to verify: ${code.length} digits`);
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify the password reset code against Redis (this also deletes the code on success)
    const isValid = await verifyPasswordResetCode(email, code);

    if (!isValid) {
      console.log(`❌ Password reset code verification failed for ${email}`);
      throw new Error('Invalid or expired password reset code');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Password reset successfully for ${email}`);
  } catch (error) {
    console.error('Error verifying password reset code:', error);
    throw error;
  }
};

export const registerUser = async (userData: RegisterUserData): Promise<IUser> => {
  try {
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Determine user type based on email
    let userType = userData.type;
    if (superAdminEmails.includes(userData.email)) {
      userType = 'super-admin';
    } else if (adminEmails.includes(userData.email)) {
      userType = 'admin';
    }

    const user = new User({
      ...userData,
      type: userType,
      password: hashedPassword,
      visibilitySettings: {
        isProfilePublic: true,
        isPersonalInfoPublic: true,
        isTravelInfoPublic: true,
      },
      securitySettings: {
        is2FAEnabled: false
      },
      safetyState: {
        isInAnEmergency: false,
        emergencyType: ""
      },
      profileImage: "",
    });

    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};


export const resetPassword = async (identifier: string, newPassword: string): Promise<void> => {
  try {
    if (!identifier || !newPassword) {
      throw new Error('Identifier and new password are required');
    }

    let user;
    if (identifier.includes('@')) {
      // If identifier is an email
      user = await User.findOne({ email: identifier });
    } else {
      // If identifier is a userId
      user = await User.findById(identifier);
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (
  userId: string, 
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> => {
  try {
    // Verify passwords match
    if (newPassword !== confirmPassword) {
      throw new Error('New passwords do not match');
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password || '');
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
  } catch (error) {
    throw error;
  }
};