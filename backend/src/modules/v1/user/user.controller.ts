import { Request, Response } from "express";
import { getUserById, getUserByIdOrUsername, updateUserSettings } from "./user.service";

interface AuthRequest extends Request {
  user?:{
    sub: string;
  };
}

export const updateUserSettingsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.sub) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const delivery = req.body?.safetySettings?.delivery ?? req.body?.delivery;
    const emergencyContact = req.body?.safetySettings?.emergencyContact ?? req.body?.emergencyContact;

    if (!delivery || typeof delivery !== "object") {
      res.status(400).json({
        success: false,
        message: "Delivery settings are required",
      });
      return;
    }

    const user = await updateUserSettings(req.user.sub, delivery, emergencyContact);

    res.status(200).json({
      success: true,
      message: "Safety settings updated successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update safety settings",
    });
  }
};

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
