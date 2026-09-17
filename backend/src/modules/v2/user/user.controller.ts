import { Request, Response } from "express";
import { getUserById, getUserByIdOrUsername, updateProfile, updateVisibilitySettings } from "./user.service";
import { detectLanguage } from "../localization/localization.service";
import { AuthRequest } from "../auth/auth.types";

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
    const allowedFields = ["username", "fname", "lname", "bio", "contactNumber", "interests"];
    const profileUpdates = allowedFields.reduce((acc, field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        acc[field as keyof typeof acc] = updates[field];
      }
      return acc;
    }, {} as Record<string, unknown>);

    if (Object.keys(profileUpdates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No profile fields provided",
      });
      return;
    }

    await updateProfile(userId, profileUpdates as any);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};