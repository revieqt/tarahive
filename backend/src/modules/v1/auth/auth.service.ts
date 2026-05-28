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
  validatePassword(data.password);

  const existingEmail = await userRepo.findOne({ where: { email: data.email } });
  if (existingEmail) throw new Error("Email already registered");

  validateAge(data.bdate);

  const hashedPassword = await hashPassword(data.password);

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

    await storeVerificationCode(email, code);

    await addSendVerificationEmailJob({email, code});

    return code;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

export const verifyUserEmail = async (email: string, code: string): Promise<Partial<User>> => {
  try {
    const isValid = await verifyVerificationCode(email, code);

    if (!isValid) throw new Error('Invalid or expired verification code');

    const pendingUserData = await getPendingRegistration(email);

    if (!pendingUserData) throw new Error('No pending registration found. Please register again.');

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
      device: [pendingUserData.device],
    });
    const savedUser = await userRepo.save(user);

    await deletePendingRegistration(email);

    const { password: _, ...userWithoutPassword } = savedUser;

    console.log(`✅ Email verified and user created for ${email}`);
    return userWithoutPassword;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};

export const loginUser = async (data: LoginDto): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> => {
  try {
    const user = await userRepo.findOne({
      where: [{ email: data.identifier },{ username: data.identifier },],
      select: ['id', 'fname', 'lname', 'email', 'username', 'password', 'bdate', 'gender', 'status', 'provider', 'type', 'isProUser', 'bio', 'profileImage', 'contactNumber', 'expPoints', 'interests', 'safetyState', 'settings', 'device', 'createdOn', 'updatedOn', 'tv'],
    });

    if (!user) throw new Error('User account not found');

    if (!user.password) throw new Error('Invalid email or password');

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    if (user.status !== UserStatus.ACTIVE) {
      if (user.status === UserStatus.SUSPENDED) {
        throw new Error('Account suspended');
      } else if (user.status === UserStatus.BANNED) {
        throw new Error('Account banned');
      }
      throw new Error('User account is inactive');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Error during login:', error);
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
    if (newPassword !== confirmPassword) throw new Error('New passwords do not match');

    const user = await userRepo.findOne({ where: { id: userId }, select: ['password'] });
    if (!user) throw new Error('User not found');

    const isValidPassword = await comparePassword(oldPassword, user.password!);
    if (!isValidPassword) throw new Error('Current password is incorrect');

    user.password = await hashPassword(newPassword);
    await userRepo.save(user);
  } catch (error) {
    throw error;
  }
};