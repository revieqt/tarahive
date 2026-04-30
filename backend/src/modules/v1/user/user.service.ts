import { AppDataSource } from "../../../config/postgres";
import { User } from "./user.entity";

const userRepo = AppDataSource.getRepository(User);

export const getUserById = async (userId: string): Promise<Partial<User>> => {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
