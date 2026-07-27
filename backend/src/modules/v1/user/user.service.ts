import { AppDataSource, userRepo } from "../../../config/postgres";
import { User } from "./user.entity";

export const getUserById = async (userId: string): Promise<Partial<User>> => {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUserByIdOrUsername = async (idOrUsername: string): Promise<Partial<User>> => {
  const user = await userRepo
    .createQueryBuilder('user')
    .where('CAST(user.id AS TEXT) = :idOrUsername', { idOrUsername })
    .orWhere('user.username = :idOrUsername', { idOrUsername })
    .getOne();

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateVisibilitySettings = async (
  userId: string,
  visibility?: { isProfilePublic?: boolean; isPersonalInfoPublic?: boolean; isTravelInfoPublic?: boolean }
): Promise<void> => {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) throw new Error("User not found");

  const currentVisibility = user.settings.visibility || {
    isProfilePublic: true,
    isPersonalInfoPublic: true,
    isTravelInfoPublic: true,
  };

  const nextVisibility = {
    isProfilePublic:
      typeof visibility?.isProfilePublic === "boolean"
        ? visibility.isProfilePublic
        : currentVisibility.isProfilePublic,
    isPersonalInfoPublic:
      typeof visibility?.isPersonalInfoPublic === "boolean"
        ? visibility.isPersonalInfoPublic
        : currentVisibility.isPersonalInfoPublic,
    isTravelInfoPublic:
      typeof visibility?.isTravelInfoPublic === "boolean"
        ? visibility.isTravelInfoPublic
        : currentVisibility.isTravelInfoPublic,
  };

  user.settings.visibility = {
    ...user.settings.visibility,
    ...nextVisibility
  };

  await userRepo.save(user);

  return;
};