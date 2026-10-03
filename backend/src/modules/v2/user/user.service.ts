import { userRepo } from "../../../config/postgres";
import { User } from "./user.entity";
import { ProfileUpdatePayload, SetupUserPayload, UserSearchResult, UserStatus } from "./user.types";

export const searchUsers = async (
  search: string,
  currentUserId: string
): Promise<UserSearchResult[]> => {
  const escapedSearch = search.replace(/[\\%_]/g, "\\$&");
  const pattern = `%${escapedSearch}%`;
  const normalizedSearch = search.toLowerCase();
  const prefixPattern = `${escapedSearch.toLowerCase()}%`;

  const users = await userRepo
    .createQueryBuilder("user")
    .select([
      "user.id",
      "user.profileImage",
      "user.fname",
      "user.lname",
      "user.username",
    ])
    .where(
      "(user.fname ILIKE :pattern ESCAPE E'\\\\' OR user.lname ILIKE :pattern ESCAPE E'\\\\' OR user.username ILIKE :pattern ESCAPE E'\\\\')",
      { pattern, normalizedSearch, prefixPattern }
    )
    .andWhere("user.id <> :currentUserId", { currentUserId })
    .andWhere("user.status = :status", { status: UserStatus.ACTIVE })
    .andWhere("user.username IS NOT NULL")
    .orderBy(
      `CASE
        WHEN LOWER(user.username) = :normalizedSearch THEN 0
        WHEN LOWER(COALESCE(user.fname, '')) = :normalizedSearch OR LOWER(COALESCE(user.lname, '')) = :normalizedSearch THEN 1
        WHEN LOWER(user.username) LIKE :prefixPattern ESCAPE E'\\\\' THEN 2
        WHEN LOWER(COALESCE(user.fname, '')) LIKE :prefixPattern ESCAPE E'\\\\' OR LOWER(COALESCE(user.lname, '')) LIKE :prefixPattern ESCAPE E'\\\\' THEN 3
        ELSE 4
      END`,
      "ASC"
    )
    .addOrderBy(
      `GREATEST(
        similarity(LOWER(COALESCE(user.username, '')), :normalizedSearch),
        similarity(LOWER(COALESCE(user.fname, '')), :normalizedSearch),
        similarity(LOWER(COALESCE(user.lname, '')), :normalizedSearch)
      )`,
      "DESC"
    )
    .addOrderBy("user.username", "ASC")
    .take(7)
    .getMany();

  return users.map((user) => ({
    id: user.id,
    profileImage: user.profileImage ?? "",
    fname: user.fname ?? "",
    lname: user.lname ?? "",
    username: user.username!,
  }));
};

export const getUserById = async (userId: string): Promise<Partial<User>> => {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
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

  return user;
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

export const updateProfile = async (
  userId: string,
  updates: ProfileUpdatePayload
): Promise<void> => {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) throw new Error("User not found");
  if (typeof updates.username !== "undefined") user.username = updates.username;
  if (typeof updates.fname !== "undefined") user.fname = updates.fname;
  if (typeof updates.lname !== "undefined") user.lname = updates.lname;
  if (typeof updates.bio !== "undefined") user.bio = updates.bio;
  if (typeof updates.interests !== "undefined") user.interests = updates.interests;

  await userRepo.save(user);
  return;
};

export const setupUser = async (
  userId: string,
  updates: SetupUserPayload
): Promise<User> => {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) throw new Error("User not found");
  if (typeof updates.fname !== "undefined") user.fname = updates.fname;
  if (typeof updates.lname !== "undefined") user.lname = updates.lname;
  if (typeof updates.bdate !== "undefined") user.bdate = updates.bdate;
  if (typeof updates.gender !== "undefined") user.gender = updates.gender;
  if (typeof updates.username !== "undefined") user.username = updates.username;
  if (typeof updates.interests !== "undefined") user.interests = updates.interests;

  await userRepo.save(user);
  return user;
};