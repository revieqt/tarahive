import { userRepo } from "../../../infrastructure/postgres/postgres";
import { storageService } from "../../../infrastructure/storage";
import { User } from "./user.entity";
import { ProfileUpdatePayload, SetupUserPayload, UserSearchResult, UserStatus } from "./user.types";

export const searchUsers = async (
  search: string,
  currentUserId: string
): Promise<UserSearchResult[]> => {
  const trimmedSearch = search.trim();
  if (!trimmedSearch) {
    return [];
  }

  const escapedSearch = trimmedSearch.replace(/[\\%_]/g, "\\$&");
  const normalizedSearch = trimmedSearch.toLowerCase();
  const searchPattern = `%${escapedSearch.toLowerCase()}%`;
  const prefixPattern = `${escapedSearch.toLowerCase()}%`;

  const users = await userRepo
    .createQueryBuilder("user")
    .select([
      "user.id",
      "user.profileImage",
      "user.fname",
      "user.lname",
      "user.username",
      "user.email",
    ])
    .where(
      "(LOWER(COALESCE(user.fname, '')) LIKE :searchPattern ESCAPE E'\\\\' OR LOWER(COALESCE(user.lname, '')) LIKE :searchPattern ESCAPE E'\\\\' OR LOWER(COALESCE(user.username, '')) LIKE :searchPattern ESCAPE E'\\\\' OR LOWER(COALESCE(user.email, '')) LIKE :searchPattern ESCAPE E'\\\\')",
      { searchPattern, normalizedSearch, prefixPattern }
    )
    .andWhere("user.id <> :currentUserId", { currentUserId })
    .andWhere("user.status = :status", { status: UserStatus.ACTIVE })
    .orderBy(
      `CASE
        WHEN LOWER(COALESCE(user.username, '')) = :normalizedSearch THEN 0
        WHEN LOWER(COALESCE(user.email, '')) = :normalizedSearch THEN 1
        WHEN LOWER(COALESCE(user.fname, '')) = :normalizedSearch OR LOWER(COALESCE(user.lname, '')) = :normalizedSearch THEN 2
        WHEN LOWER(COALESCE(user.username, '')) LIKE :prefixPattern ESCAPE E'\\\\' THEN 3
        WHEN LOWER(COALESCE(user.email, '')) LIKE :prefixPattern ESCAPE E'\\\\' THEN 4
        WHEN LOWER(COALESCE(user.fname, '')) LIKE :prefixPattern ESCAPE E'\\\\' OR LOWER(COALESCE(user.lname, '')) LIKE :prefixPattern ESCAPE E'\\\\' THEN 5
        ELSE 6
      END`,
      "ASC"
    )
    .addOrderBy("user.username", "ASC")
    .take(7)
    .getMany();

  return users.map((user) => {
    const username = user.username ?? user.email?.split("@")[0] ?? "";

    return {
      id: user.id,
      profileImage: user.profileImage ?? "",
      fname: user.fname ?? "",
      lname: user.lname ?? "",
      username,
    };
  });
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
  updates: ProfileUpdatePayload,
  profileImage?: Buffer,
): Promise<User> => {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) throw new Error("User not found");
  if (typeof updates.username !== "undefined") user.username = updates.username;
  if (typeof updates.fname !== "undefined") user.fname = updates.fname;
  if (typeof updates.lname !== "undefined") user.lname = updates.lname;
  if (typeof updates.bio !== "undefined") user.bio = updates.bio;
  if (typeof updates.interests !== "undefined") user.interests = updates.interests;

  const oldImageKey = user.profileImage?.startsWith("/storage/")
    ? user.profileImage.slice("/storage/".length)
    : undefined;
  const storedImage = profileImage
    ? await storageService.uploadImage(profileImage, "profileImages")
    : undefined;

  if (storedImage) {
    user.profileImage = `/storage/${storedImage.key}`;
  }

  let savedUser: User;
  try {
    savedUser = await userRepo.save(user);
  } catch (error) {
    if (storedImage) {
      try {
        await storageService.deleteImage(storedImage.key);
      } catch (cleanupError) {
        console.error("Failed to remove profile image after profile update failed", cleanupError);
      }
    }
    throw error;
  }

  if (storedImage && oldImageKey) {
    await storageService.deleteImage(oldImageKey);
  }

  return savedUser;
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