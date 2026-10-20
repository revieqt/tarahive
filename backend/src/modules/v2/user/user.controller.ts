import { Request, Response } from "express";
import { getUserById, getUserByIdOrUsername, searchUsers, updateProfile, updateVisibilitySettings, setupUser } from "./user.service";
import { detectLanguage } from "../localization/localization.service";
import { AuthRequest } from "../auth/auth.types";
import { ImageValidationError } from "../../../infrastructure/storage/validators/image-validator.service";

/**
 * GET /user/me
 * Get the authenticated user's profile
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await getUserById(req.user?.sub as string);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user profile",
    });
  }
};

/**
 * GET /user/:id
 * Get a user's profile by id or username
 */
export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await getUserByIdOrUsername(id as string);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user",
    });
  }
};

export const searchUsersController = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  const search = req.query.search;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (typeof search !== "string") {
    res.status(400).json({ success: false, message: "Search query is required" });
    return;
  }

  const normalizedSearch = search.trim();
  if (normalizedSearch.length < 3 || normalizedSearch.length > 100) {
    res.status(400).json({ success: false, message: "Search query must be between 3 and 100 characters" });
    return;
  }

  try {
    const users = await searchUsers(normalizedSearch, userId);
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search users",
    });
  }
};

export const updateVisibilityController = async (req: AuthRequest, res: Response): Promise<void> => {
  const lang = detectLanguage(req.headers['accept-language']);
  try {
    const visibility = req.body?.visibility;

    if (!visibility || typeof visibility !== "object") {
      res.status(400).json({
        success: false,
        message: "Visibility settings are required",
      });
      return;
    }

    await updateVisibilitySettings(req.user?.sub as string, visibility);

    res.status(200).json({
      success: true,
      message: "Visibility settings updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  const lang = detectLanguage(req.headers['accept-language']);
  try {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const updates = req.body ?? {};
    const profileUpdates: {
      username?: string;
      fname?: string;
      lname?: string;
      bio?: string;
      interests?: string[];
    } = {};

    for (const field of ["username", "fname", "lname", "bio"] as const) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        if (typeof updates[field] !== "string") {
          res.status(400).json({
            success: false,
            message: `${field} must be a string`,
          });
          return;
        }
        profileUpdates[field] = updates[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, "interests")) {
      let interests = updates.interests;
      if (typeof interests === "string") {
        try {
          interests = JSON.parse(interests);
        } catch {
          res.status(400).json({
            success: false,
            message: "Interests must be a valid array",
          });
          return;
        }
      }

      if (
        !Array.isArray(interests) ||
        !interests.every((interest: unknown) => typeof interest === "string")
      ) {
        res.status(400).json({
          success: false,
          message: "Interests must be an array of strings",
        });
        return;
      }
      profileUpdates.interests = interests;
    }

    let profileImage: Buffer | undefined;
    if (Object.prototype.hasOwnProperty.call(updates, "profileImage")) {
      const encodedImage = updates.profileImage;
      const maxBase64Length = Math.ceil((5 * 1024 * 1024) / 3) * 4;
      const isValidBase64 =
        typeof encodedImage === "string" &&
        encodedImage.length > 0 &&
        encodedImage.length <= maxBase64Length &&
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encodedImage);

      if (!isValidBase64) {
        res.status(400).json({
          success: false,
          message: "Profile image must be valid base64 data no larger than 5 MB",
        });
        return;
      }

      profileImage = Buffer.from(encodedImage, "base64");
      if (profileImage.length > 5 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          message: "Profile image must be 5 MB or smaller",
        });
        return;
      }
    }

    if (Object.keys(profileUpdates).length === 0 && !profileImage) {
      res.status(400).json({
        success: false,
        message: "No profile fields provided",
      });
      return;
    }

    const user = await updateProfile(userId, profileUpdates, profileImage);

    res.status(200).json({
      success: true,
      data: { profileImage: user.profileImage },
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    if (error instanceof ImageValidationError) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const setupUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const lang = detectLanguage(req.headers['accept-language']);
  try {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const updates = req.body ?? {};
    const allowedFields = ["fname", "lname", "bdate", "gender", "username", "interests"];
    const profileUpdates = allowedFields.reduce((acc, field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        acc[field as keyof typeof acc] = updates[field];
      }
      return acc;
    }, {} as Record<string, unknown>);

    if (Object.keys(profileUpdates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No fields provided",
      });
      return;
    }

    const user = await setupUser(userId, profileUpdates as any);

    res.status(200).json({
      success: true,
      message: "User account setup successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};