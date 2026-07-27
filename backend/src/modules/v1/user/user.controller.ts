import { Request, Response } from "express";
import { getUserById, getUserByIdOrUsername, updateVisibilitySettings } from "./user.service";
import { detectLanguage } from "../localization/localization.service";
import { AuthRequest } from "../auth/auth.types";

/**
 * GET /user/me
 * Get the authenticated user's profile
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.sub) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await getUserById(req.user.sub);

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
    if (!req.user || !req.user.sub) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "User id or username is required",
      });
      return;
    }

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
    if (!req.user || !req.user.sub) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const visibility = req.body?.visibility;

    if (!visibility || typeof visibility !== "object") {
      res.status(400).json({
        success: false,
        message: "Visibility settings are required",
      });
      return;
    }

    await updateVisibilitySettings(req.user.sub, visibility);

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