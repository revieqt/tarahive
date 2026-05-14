import { AppDataSource } from "../../../config/postgres";
import { User } from "../user/user.entity";
import { Provider, UserStatus, UserType } from "../user/user.types";
import { validatePassword, validateAge, hashPassword, generateVerificationCode, comparePassword, generateUsername } from "./auth.utils";
import { RegisterDto, LoginDto } from "./auth.types";
import { addSendVerificationEmailJob, addSendPasswordResetEmailJob } from './auth.queue';
import jwt from 'jsonwebtoken';
import {
  storeVerificationCode,
  verifyVerificationCode,
  storePasswordResetCode,
  verifyPasswordResetCode,
} from './auth.redis';

const userRepo = AppDataSource.getRepository(User);

export const generateAccessToken = (user: User): string => {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  const userId = (user.id as any).toString();
  const accessToken = jwt.sign(
    { id: userId, email: user.email },
    secretKey,
    { expiresIn: '1h' }
  );
  return accessToken;
}

export const generateRefreshToken = (user: User): string => {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  const userId = (user.id as any).toString();
  const refreshToken = jwt.sign(
    { id: userId , email: user.email },
    secretKey,
    { expiresIn: '14d' }
  );
  return refreshToken;
}

export const registerUser = async (data: RegisterDto): Promise<Partial<User>> => {
  // 1. Validate password
  validatePassword(data.password);

  // 2. Check if email already exists
  const existingEmail = await userRepo.findOne({ where: { email: data.email } });
  if (existingEmail) throw new Error("Email already registered");

  // 4. Validate age (13 years old and above)
  validateAge(data.bdate);

  // 5. Hash password
  const hashedPassword = await hashPassword(data.password);

  // 6. Create user
  const user = userRepo.create({
    fname: data.fname,
    lname: data.lname,
    email: data.email,
    username: generateUsername(data.fname),
    password: hashedPassword,
    bdate: new Date(data.bdate),
    gender: data.gender,
    provider: Provider.EMAIL,
    type: UserType.TRAVELER,
    status: UserStatus.ACTIVE,
    isProUser: false,
    expPoints: 0,
      interests: [],
      safetyState: {
        isInAnEmergency: false,
        emergencyContact: {},
      },
      settings: {
        visibility: {
          isProfilePublic: true,
          isPersonalInfoPublic: true,
          isTravelInfoPublic: true,
        },
        personalization: {
          pushNotifications: true,
          locationSharing: false,
        },
        security: {
          is2FAEnabled: false,
        },
        taraBuddy: {
          isTaraBuddyEnabled: false,
        },
      },
      device: [data.device],
    });

    const savedUser = await userRepo.save(user);

    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

export const sendVerificationCode = async (email: string): Promise<string> => {
  try {
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const code = generateVerificationCode();

    // Store code in Redis with 30-minute expiration
    await storeVerificationCode(email, code);

    // Queue the email job to send the code
    await addSendVerificationEmailJob({
      email,
      code,
    });

    console.log(`📧 Verification code generated and queued for ${email}`);
    return code;
  } catch (error) {
    console.error('Error sending verification code:', error);
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
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    user.status = UserStatus.ACTIVE;
    await userRepo.save(user);

    console.log(`✅ Email verified and user activated for ${email}`);
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};

export const loginUser = async (data: LoginDto): Promise<{
  success: boolean;
  message: string;
  nextStep?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: Partial<User>;
  email?: string;
}> => {
  // Find user by email or username and explicitly include the password hash
  const user = await userRepo
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email = :identifier', { identifier: data.identifier })
    .orWhere('user.username = :identifier', { identifier: data.identifier })
    .getOne();

  if (!user) throw new Error('Invalid username or password');
  if (!user.password) throw new Error('Invalid username or password');

  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) throw new Error('Invalid username or password');

  // Check user status
  if (user.status === UserStatus.ACTIVE) {
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      nextStep: 'home',
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  } else if (user.status === UserStatus.PENDING) {
    return {
      success: false,
      message: 'You need to verify your email first before you continue.',
      nextStep: 'email-verification',
      email: user.email,
    };
  } else if (user.status === UserStatus.BANNED) {
    return {
      success: false,
      message: 'You are currently banned',
      nextStep: 'login',
    };
  }

  throw new Error('Account status unknown');
};

export const updatePassword = async (
  userId: string, 
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> => {
  try {
    // Find user and explicitly include password hash
    const user = await userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) throw new Error('User not found');
    // Verify passwords match
    if (newPassword !== confirmPassword) throw new Error('New passwords do not match');
    // Validate new password strength
    validatePassword(newPassword);
    // Verify old password
    if (!user.password) throw new Error('Current password is incorrect');
    const isValidPassword = await comparePassword(oldPassword, user.password);
    if (!isValidPassword) throw new Error('Current password is incorrect');

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await userRepo.save(user);
  } catch (error) {
    throw error;
  }
};