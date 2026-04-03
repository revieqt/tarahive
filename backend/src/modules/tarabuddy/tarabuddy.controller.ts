import { Request, Response } from "express";
import {
  enableTaraBuddyService,
  disableTaraBuddyService,
  searchTaraBuddiesService,
  likeTaraBuddyService,
  updateGenderPreferenceService,
  updateDistancePreferenceService,
  updateAgePreferenceService,
  updateZodiacPreferenceService,
  getMatchesService,
  unmatchService,
} from "./tarabuddy.service";

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Enable TaraBuddy feature
 * POST /api/tarabuddy/enable
 */
export const enableTaraBuddy = async (req: AuthRequest, res: Response) => {
  try {
    console.log("🟡 enableTaraBuddy - Enabling for user:", req.user?.id);

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    const updatedUser = await enableTaraBuddyService(userId);

    res.status(200).json({
      success: true,
      message: "TaraBuddy enabled successfully",
      data: updatedUser.taraBuddySettings,
    });
  } catch (error) {
    console.error("❌ Error enabling TaraBuddy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enable TaraBuddy",
      error: (error as Error).message,
    });
  }
};

/**
 * Disable TaraBuddy feature
 * POST /api/tarabuddy/disable
 */
export const disableTaraBuddy = async (req: AuthRequest, res: Response) => {
  try {
    console.log("🟡 disableTaraBuddy - Disabling for user:", req.user?.id);

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    const updatedUser = await disableTaraBuddyService(userId);

    res.status(200).json({
      success: true,
      message: "TaraBuddy disabled successfully",
      data: updatedUser.taraBuddySettings,
    });
  } catch (error) {
    console.error("❌ Error disabling TaraBuddy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disable TaraBuddy",
      error: (error as Error).message,
    });
  }
};

/**
 * Search for TaraBuddy matches
 * POST /api/tarabuddy/search
 */
export const searchTaraBuddies = async (req: AuthRequest, res: Response) => {
  try {
    console.log("🟡 searchTaraBuddies - Searching for user:", req.user?.id);

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    const results = await searchTaraBuddiesService(userId);

    res.status(200).json({
      success: true,
      message: "TaraBuddy search completed",
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("❌ Error searching TaraBuddies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search TaraBuddies",
      error: (error as Error).message,
    });
  }
};

/**
 * Like a TaraBuddy user
 * POST /api/tarabuddy/like
 */
export const likeTaraBuddy = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { likedUserId } = req.body;

    console.log("🟡 likeTaraBuddy - User:", userId, "liked:", likedUserId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    if (!likedUserId) {
      return res.status(400).json({ message: "Missing required field: likedUserId" });
    }

    const result = await likeTaraBuddyService(userId, likedUserId);

    res.status(result.success ? 200 : 400).json({
      success: result.success,
      match: result.match,
      message: result.message,
      matchedWith: result.matchedWith,
      matchedFname: result.matchedFname,
    });
  } catch (error) {
    console.error("❌ Error liking TaraBuddy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like TaraBuddy",
      error: (error as Error).message,
    });
  }
};

/**
 * Update gender preference
 * PATCH /api/tarabuddy/update-gender-preference
 */
export const updateGenderPreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { preference } = req.body;

    console.log("🟡 updateGenderPreference - User:", userId, "preference:", preference);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    if (!preference) {
      return res.status(400).json({ message: "Missing required field: preference" });
    }

    const updatedUser = await updateGenderPreferenceService(userId, preference);

    res.status(200).json({
      success: true,
      message: "Gender preference updated successfully",
      data: updatedUser.taraBuddySettings,
    });
  } catch (error) {
    console.error("❌ Error updating gender preference:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update gender preference",
      error: (error as Error).message,
    });
  }
};

/**
 * Update distance preference
 * PATCH /api/tarabuddy/update-distance-preference
 */
export const updateDistancePreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { preference } = req.body;

    console.log("🟡 updateDistancePreference - User:", userId, "preference:", preference);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    if (preference === undefined || preference === null) {
      return res.status(400).json({ message: "Missing required field: preference" });
    }

    const updatedUser = await updateDistancePreferenceService(userId, preference);

    res.status(200).json({
      success: true,
      message: "Distance preference updated successfully",
      data: updatedUser.taraBuddySettings,
    });
  } catch (error) {
    console.error("❌ Error updating distance preference:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update distance preference",
      error: (error as Error).message,
    });
  }
};

/**
 * Update age range preference
 * PATCH /api/tarabuddy/update-age-preference
 */
export const updateAgePreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { preference } = req.body;

    console.log("🟡 updateAgePreference - User:", userId, "preference:", preference, "type:", typeof preference);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID found" });
    }

    // Validate preference format
    if (!preference || !Array.isArray(preference) || preference.length !== 2) {
      console.error("❌ Invalid preference format:", preference);
      return res
        .status(400)
        .json({ success: false, message: "Invalid preference format. Expected array of 2 numbers." });
    }

    // Validate that both values are numbers
    if (typeof preference[0] !== 'number' || typeof preference[1] !== 'number') {
      console.error("❌ Preference values are not numbers:", preference[0], preference[1]);
      return res
        .status(400)
        .json({ success: false, message: "Both values must be numbers." });
    }

    // Validate age range
    const [minAge, maxAge] = preference;
    if (minAge < 18 || maxAge > 100 || minAge > maxAge) {
      console.error("❌ Age values out of range:", minAge, maxAge);
      return res
        .status(400)
        .json({ success: false, message: "Age must be between 18 and 100, and minimum must be less than maximum." });
    }

    console.log("✅ Preference validation passed:", preference);
    const updatedUser = await updateAgePreferenceService(userId, preference as [number, number]);

    // Ensure taraBuddySettings exists
    if (!updatedUser || !updatedUser.taraBuddySettings) {
      console.error("❌ TaraBuddySettings not found in updated user");
      return res.status(500).json({
        success: false,
        message: "TaraBuddySettings not found after update",
      });
    }

    console.log("✅ Returning taraBuddySettings:", updatedUser.taraBuddySettings);
    
    res.status(200).json({
      success: true,
      message: "Age preference updated successfully",
      data: updatedUser.taraBuddySettings,
    });
  } catch (error) {
    console.error("❌ Error updating age preference:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update age preference",
      error: (error as Error).message,
    });
  }
};

/**
 * Update zodiac preference
 * PATCH /api/tarabuddy/update-zodiac-preference
 */
export const updateZodiacPreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { preference } = req.body;

    console.log("🟡 updateZodiacPreference - User:", userId, "preference:", preference);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    if (!preference || !Array.isArray(preference)) {
      return res.status(400).json({ message: "Invalid preference format. Expected array." });
    }

    const updatedUser = await updateZodiacPreferenceService(userId, preference);

    res.status(200).json({
      success: true,
      message: "Zodiac preference updated successfully",
      data: updatedUser.taraBuddySettings,
    });
  } catch (error) {
    console.error("❌ Error updating zodiac preference:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update zodiac preference",
      error: (error as Error).message,
    });
  }
};

/**
 * Get all matches for the current user
 * GET /api/tarabuddy/matches
 */
export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    console.log("🟡 getMatches - Getting matches for user:", req.user?.id);

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID found" });
    }

    const matches = await getMatchesService(userId);

    res.status(200).json({
      success: true,
      message: "Matches retrieved successfully",
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("❌ Error getting matches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get matches",
      error: (error as Error).message,
    });
  }
};

/**
 * Unmatch with a user
 * POST /api/tarabuddy/unmatch
 */
export const unmatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { userID } = req.body;

    console.log("🟡 unmatch - User:", userId, "unmatching with:", userID);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID found" });
    }

    if (!userID) {
      return res.status(400).json({ success: false, message: "Missing required field: userID" });
    }

    const result = await unmatchService(userId, userID);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("❌ Error unmatching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unmatch user",
      error: (error as Error).message,
    });
  }
};
