import { AppDataSource } from "../../../config/postgres";
import { Auth } from "./auth.entity";
import { User } from "../user/user.entity";
import { UserStatus, UserType } from "../user/user.types";
import { AuthProvider } from "./auth.types";
import { generateVerificationCode } from "./auth.utils";
import { queueEmail } from '../../../workers/delivery/email.queue';
import {
  storeVerificationCode,
  verifyVerificationCode,
} from './auth.redis';

const authRepo = AppDataSource.getRepository(Auth);

export interface VerifyUserEmailResult {
  user: User;
  newAccount: boolean;
}

export const findAccountByProvider = async (
  provider: AuthProvider,
  providerId: string,
): Promise<Auth | null> => {
  return authRepo.findOne({
    where: { provider, providerId },
    relations: { user: true },
  });
};

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
    const normalizedEmail = email.trim().toLowerCase();
    const code = generateVerificationCode();

    await storeVerificationCode(normalizedEmail, code);

    await queueEmail({
      to: normalizedEmail,
      subject: 'Tarahive Email Verification',
      content: generateVerificationEmailContent(code),
    });

    return;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

export const verifyUserEmail = async (
  email: string,
  code: string,
  device?: Partial<User["devices"][number]>,
): Promise<VerifyUserEmailResult> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const isValid = await verifyVerificationCode(normalizedEmail, code);

    if (!isValid) throw new Error('Invalid or expired verification code');

    const existingAuth = await findAccountByProvider(
      AuthProvider.EMAIL,
      normalizedEmail,
    );

    if (existingAuth?.user) {
      return { user: existingAuth.user, newAccount: false };
    }

    return AppDataSource.transaction(async (manager) => {
      const existingAuth = await manager.findOne(Auth, {
        where: {
          provider: AuthProvider.EMAIL,
          providerId: normalizedEmail,
        },
        relations: { user: true },
      });

      if (existingAuth?.user) {
        return { user: existingAuth.user, newAccount: false };
      }

      const existingUser = await manager.findOne(User, {
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        const auth = manager.create(Auth, {
          userId: existingUser.id,
          user: existingUser,
          provider: AuthProvider.EMAIL,
          providerId: normalizedEmail,
          email: normalizedEmail,
          isVerified: true,
        });
        await manager.save(Auth, auth);

        return { user: existingUser, newAccount: false };
      }

      const user = manager.create(User, {
        email: normalizedEmail,
        type: UserType.TRAVELER,
        status: UserStatus.ACTIVE,
        devices: device ? [{
          deviceId: device.deviceId || "",
          brand: device.brand || "",
          model: device.model || "",
          os: device.os || "",
          type: device.type || "",
          appVersion: device.appVersion,
        }] : [],
      });
      const savedUser = await manager.save(User, user);
      const newAccount = true;

      const auth = manager.create(Auth, {
        userId: savedUser.id,
        user: savedUser,
        provider: AuthProvider.EMAIL,
        providerId: normalizedEmail,
        email: normalizedEmail,
        isVerified: true,
      });
      await manager.save(Auth, auth);

      return { user: savedUser, newAccount };
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};