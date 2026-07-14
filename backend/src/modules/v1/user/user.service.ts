import { AppDataSource } from "../../../config/postgres";
import { User } from "./user.entity";

const userRepository = AppDataSource.getRepository(User);

export const getUserById = async (userId: string): Promise<Partial<User>> => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUserByIdOrUsername = async (idOrUsername: string): Promise<Partial<User>> => {
  const user = await userRepository
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

export const updateUserSettings = async (
  userId: string,
  delivery?: { isEmailEnabled?: boolean; isSMSEnabled?: boolean },
  emergencyContact?: { email?: string; phone?: string }
): Promise<Partial<User>> => {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const currentDelivery = user.safetyState?.delivery || {
    isEmailEnabled: false,
    isSMSEnabled: false,
  };

  const nextDelivery = {
    isEmailEnabled:
      typeof delivery?.isEmailEnabled === "boolean"
        ? delivery.isEmailEnabled
        : currentDelivery.isEmailEnabled,
    isSMSEnabled:
      typeof delivery?.isSMSEnabled === "boolean"
        ? delivery.isSMSEnabled
        : currentDelivery.isSMSEnabled,
  };

  const currentEmergencyContact = user.safetyState?.emergencyContact || {};
  const nextEmergencyContact = {
    ...currentEmergencyContact,
    ...(typeof emergencyContact?.email === "string" ? { email: emergencyContact.email } : {}),
    ...(typeof emergencyContact?.phone === "string" ? { phone: emergencyContact.phone } : {}),
  };

  user.safetyState = {
    ...user.safetyState,
    delivery: nextDelivery,
    emergencyContact: nextEmergencyContact,
  };

  await userRepository.save(user);

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
