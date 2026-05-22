import { AppDataSource } from "../../../config/postgres";
import { User } from "../user/user.entity";
import { Provider, UserStatus, UserType } from "../user/user.types";
import { validatePassword, validateAge, hashPassword, generateVerificationCode, comparePassword, generateUsername } from "./auth.utils";
import { RegisterDto, LoginDto } from "./auth.types";
import { addSendVerificationEmailJob, addSendPasswordResetEmailJob } from './auth.queue';
import { generateAccessToken, generateRefreshToken } from "./token.service";
import {
  storeVerificationCode,
  verifyVerificationCode,
  storePasswordResetCode,
  verifyPasswordResetCode,
  storePendingRegistration,
  getPendingRegistration,
  deletePendingRegistration,
} from './auth.redis';

const userRepo = AppDataSource.getRepository(User);

export const registerUser = async (data: RegisterDto): Promise<{ success: boolean; message: string; email: string }> => {
  // 1. Validate password
  validatePassword(data.password);

  // 2. Check if email already exists
  const existingEmail = await userRepo.findOne({ where: { email: data.email } });
  if (existingEmail) throw new Error("Email already registered");

  // 3. Validate age (13 years old and above)
  validateAge(data.bdate);

  // 4. Hash password
  const hashedPassword = await hashPassword(data.password);

  // 5. Store only user-provided data in Redis (expires in 30 minutes)
  const pendingUserData = {
    fname: data.fname,
    lname: data.lname,
    email: data.email,
    password: hashedPassword,
    bdate: new Date(data.bdate),
    gender: data.gender,
    device: data.device,
  };

  await storePendingRegistration(data.email, pendingUserData);

  // 6. Trigger verification code sending
  await sendVerificationCode(data.email);

  return {
    success: true,
    message: 'Registration initiated. Please verify your email to complete registration.',
    email: data.email,
  };
};

export const sendVerificationCode = async (email: string): Promise<string> => {
  try {
    const code = generateVerificationCode();

    // Store code in Redis with 30-minute expiration
    await storeVerificationCode(email, code);

    // Queue the email job to send the code
    await addSendVerificationEmailJob({email, code});

    return code;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

export const verifyUserEmail = async (email: string, code: string): Promise<Partial<User>> => {
  try {
    // 1. Verify the code against Redis
    const isValid = await verifyVerificationCode(email, code);

    if (!isValid) throw new Error('Invalid or expired verification code');

    // 2. Retrieve pending registration data from Redis
    const pendingUserData = await getPendingRegistration(email);

    if (!pendingUserData) {
      throw new Error('No pending registration found. Please register again.');
    }

    // 3. Create user in database with pending data + default values
    const user = userRepo.create({
      fname: pendingUserData.fname,
      lname: pendingUserData.lname,
      email: pendingUserData.email,
      username: generateUsername(pendingUserData.fname),
      password: pendingUserData.password,
      bdate: pendingUserData.bdate,
      gender: pendingUserData.gender,
      provider: Provider.EMAIL,
      type: UserType.TRAVELER,
      status: UserStatus.ACTIVE, // Activate user after verification
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
      device: [pendingUserData.device],
    });

    const savedUser = await userRepo.save(user);

    // 4. Delete pending registration from Redis
    await deletePendingRegistration(email);

    // 5. Return user without password
    const { password: _, ...userWithoutPassword } = savedUser;

    console.log(`✅ Email verified and user created for ${email}`);
    return userWithoutPassword;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};