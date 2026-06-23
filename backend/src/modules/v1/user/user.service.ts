import { AppDataSource } from "../../../config/postgres";
import { User } from "./user.entity";

export const getUserById = async (userId: string): Promise<Partial<User>> => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUserByIdOrUsername = async (idOrUsername: string): Promise<Partial<User>> => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({
    where: [
      { id: idOrUsername },
      { username: idOrUsername }
    ]
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
