import { AppDataSource } from "../../../config/postgres";
import { User } from "../user/user.entity";
import { Provider, UserStatus, UserType } from "../user/user.types";
import { generateVerificationCode, generateUsername } from "./auth.utils";
import { queueEmail } from '../../../workers/delivery/email.queue';
import { generateAccessToken, generateRefreshToken } from "./token.service";
import {
  storeVerificationCode,
  verifyVerificationCode,
} from './auth.redis';

const userRepo = AppDataSource.getRepository(User);

const generateVerificationEmailContent = (code: string): string => {
  return `
    <div style="text-align: center;">
      <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
      <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
        Please use the following code to verify your email address:
      </p>
      <div style="background-color: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h1 style="font-size: 48px; letter-spacing: 10px; margin: 0; color: #4f46e5; font-weight: bold;">
          ${code}
        </h1>
      </div>
      <p style="color: #999; font-size: 14px;">
        This code will expire in 30 minutes.
      </p>
      <p style="color: #999; font-size: 14px;">
        If you didn't request this verification, please ignore this email.
      </p>
    </div>
  `;
};

export const sendVerificationCode = async (email: string): Promise<void> => {
  try {
    const code = generateVerificationCode();

    await storeVerificationCode(email, code);

    await queueEmail({
      to: email,
      subject: 'Tarahive Email Verification',
      content: generateVerificationEmailContent(code),
    });

    return;
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
    
    if (!pendingUserData.fname || !pendingUserData.fname.trim()) throw new Error('First name is required to complete registration');

    const user = userRepo.create({
      fname: pendingUserData.fname.trim(),
      lname: pendingUserData.lname?.trim() || null,
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
        delivery: {
          isEmailEnabled: false,
          isSMSEnabled: false,
          alertLang: "en"
        },
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