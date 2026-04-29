import { AppDataSource } from "../../../config/postgres";
import { User } from "../user/user.entity";
import { Provider, UserStatus, UserType } from "../user/user.types";
import { validatePassword, validateAge, hashPassword } from "./auth.utils";
import { RegisterDto } from "./auth.types";

const userRepo = AppDataSource.getRepository(User);

export const registerUser = async (data: RegisterDto): Promise<Partial<User>> => {
  // 1. Validate password
  validatePassword(data.password);

  // 2. Check if email already exists
  const existingEmail = await userRepo.findOne({ where: { email: data.email } });
  if (existingEmail) throw new Error("Email already registered");
  
  // 3. Check if username already exists
  const existingUsername = await userRepo.findOne({ where: { username: data.username } });
  if (existingUsername) throw new Error("Username already taken");

  // 4. Validate age (13 years old and above)
  validateAge(data.bdate);

  // 5. Hash password
  const hashedPassword = await hashPassword(data.password);

  // 6. Create user
  const user = userRepo.create({
    fname: data.fname,
    lname: data.lname,
    email: data.email,
    username: data.username,
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

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }