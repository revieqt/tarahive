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
