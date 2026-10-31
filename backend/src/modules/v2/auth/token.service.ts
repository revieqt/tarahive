import { createHash } from "crypto";
import { AppDataSource } from "../../../infrastructure/postgres/postgres";
import { User } from "../user/user.entity";
import jwt from 'jsonwebtoken';
import { JwtPayload } from "jsonwebtoken";
import { UserStatus } from "../user/user.types";
import { RefreshToken } from "./refresh-token.entity";

export const generateAccessToken = (user: User): string => {
  const secretKey = process.env.ACCESS_TOKEN_SECRET || 'default_secret';
  let statusField = "";
  
  switch(user.status){
    case UserStatus.ACTIVE:
      statusField = "a";
      break;
    case UserStatus.SUSPENDED:
      statusField = "s";
      break;
    case UserStatus.BANNED:
      statusField = "b";
      break;
  }

  const accessToken = jwt.sign(
    { 
      sub: (user.id as any).toString(),
      tv: user.tv,
      st: statusField,
    },
    secretKey,
    { expiresIn: '1h' }
  );
  return accessToken;
}

export const generateRefreshToken = (user: User): string => {
  const secretKey = process.env.REFRESH_TOKEN_SECRET || 'default_secret';
  const refreshToken = jwt.sign(
    { 
      sub: (user.id as any).toString(),
      tv: user.tv,
    },
    secretKey,
    { expiresIn: '14d' }
  );
  return refreshToken;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const hashRefreshToken = (token: string): string =>
  createHash("sha256").update(token, "utf8").digest("hex");

const getRefreshTokenExpiry = (token: string): Date => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === "string" || !decoded.exp) {
    throw new Error("Refresh token has no expiration");
  }
  return new Date(decoded.exp * 1000);
};

const createStoredToken = (
  user: User,
  token: string,
  deviceInfo?: Record<string, unknown>,
): RefreshToken => {
  const stored = new RefreshToken();
  stored.userId = user.id;
  stored.user = user;
  stored.tokenHash = hashRefreshToken(token);
  stored.expiresAt = getRefreshTokenExpiry(token);
  stored.revokedAt = null;
  stored.deviceInfo = deviceInfo || null;
  return stored;
};

export const storeRefreshToken = async (
  user: User,
  token: string,
  deviceInfo?: Record<string, unknown>,
): Promise<void> => {
  await AppDataSource.getRepository(RefreshToken).save(
    createStoredToken(user, token, deviceInfo),
  );
};

export const issueTokenPair = async (
  user: User,
  deviceInfo?: Record<string, unknown>,
): Promise<RefreshTokenResponse> => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await storeRefreshToken(user, refreshToken, deviceInfo);
  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (
  token: string,
): Promise<RefreshTokenResponse> => {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || "default_secret",
    ) as JwtPayload;
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  if (typeof payload.sub !== "string") {
    throw new Error("Invalid refresh token");
  }

  return AppDataSource.transaction(async (manager) => {
    const repository = manager.getRepository(RefreshToken);
    const stored = await repository.findOne({
      where: { tokenHash: hashRefreshToken(token) },
      relations: { user: true },
      lock: { mode: "pessimistic_write" },
    });

    if (!stored) {
      throw new Error("Invalid or expired refresh token");
    }

    if (stored.revokedAt) {
      await repository
        .createQueryBuilder()
        .update(RefreshToken)
        .set({ revokedAt: new Date() })
        .where("user_id = :userId AND revoked_at IS NULL", {
          userId: stored.userId,
        })
        .execute();
      throw new Error("Refresh token reuse detected");
    }

    if (stored.expiresAt <= new Date() || stored.user.id !== payload.sub) {
      throw new Error("Invalid or expired refresh token");
    }

    if (
      stored.user.status !== UserStatus.ACTIVE ||
      stored.user.tv !== payload.tv
    ) {
      throw new Error("User is not authorized");
    }

    const revoked = await repository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where("id = :id AND revoked_at IS NULL", { id: stored.id })
      .execute();

    if (revoked.affected !== 1) {
      throw new Error("Refresh token reuse detected");
    }

    const accessToken = generateAccessToken(stored.user);
    const refreshToken = generateRefreshToken(stored.user);
    await manager.save(
      RefreshToken,
      createStoredToken(
        stored.user,
        refreshToken,
        stored.deviceInfo || undefined,
      ),
    );
    return { accessToken, refreshToken };
  });
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await AppDataSource.getRepository(RefreshToken)
    .createQueryBuilder()
    .update(RefreshToken)
    .set({ revokedAt: new Date() })
    .where("token_hash = :tokenHash AND revoked_at IS NULL", {
      tokenHash: hashRefreshToken(token),
    })
    .execute();
};

export const revokeAllRefreshTokens = async (userId: string): Promise<void> => {
  await AppDataSource.getRepository(RefreshToken)
    .createQueryBuilder()
    .update(RefreshToken)
    .set({ revokedAt: new Date() })
    .where("user_id = :userId AND revoked_at IS NULL", { userId })
    .execute();
};