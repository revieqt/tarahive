import User from "../account/account.model";
import { TaraBuddyLikeModel } from "./tarabuddy.model";
import { ITaraBuddySearchResult } from "./tarabuddy.types";

/**
 * Enable TaraBuddy for a user
 * Sets default taraBuddySettings if not already set
 */
export const enableTaraBuddyService = async (userId: string) => {
  try {
    console.log("🟡 enableTaraBuddyService - Enabling TaraBuddy for user:", userId);

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if taraBuddySettings exists and is not null
    if (!user.taraBuddySettings) {
      // Set default settings if they don't exist
      user.taraBuddySettings = {
        isTaraBuddyEnabled: true,
        preferredGender: "All",
        preferredDistance: 20,
        preferredAgeRange: [18, 50],
        preferredZodiac: [],
      };
    } else {
      // Update only the enabled flag if settings already exist
      user.taraBuddySettings.isTaraBuddyEnabled = true;
    }

    user.updatedOn = new Date();
    const updatedUser = await user.save();

    console.log("✅ TaraBuddy enabled successfully for user:", userId);
    return updatedUser;
  } catch (error) {
    console.error("❌ Error enabling TaraBuddy:", error);
    throw error;
  }
};

/**
 * Disable TaraBuddy for a user
 */
export const disableTaraBuddyService = async (userId: string) => {
  try {
    console.log("🟡 disableTaraBuddyService - Disabling TaraBuddy for user:", userId);

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.taraBuddySettings) {
      user.taraBuddySettings.isTaraBuddyEnabled = false;
      user.updatedOn = new Date();
      const updatedUser = await user.save();
      console.log("✅ TaraBuddy disabled successfully for user:", userId);
      return updatedUser;
    }

    throw new Error("TaraBuddy not enabled for this user");
  } catch (error) {
    console.error("❌ Error disabling TaraBuddy:", error);
    throw error;
  }
};

/**
 * Search for TaraBuddy matches based on user preferences
 * Prioritizes users that match preferences, then returns others with TaraBuddy enabled
 */
export const searchTaraBuddiesService = async (
  userId: string
): Promise<ITaraBuddySearchResult[]> => {
  try {
    console.log("🟡 searchTaraBuddiesService - Searching for buddies for user:", userId);

    const user = await User.findById(userId);

    if (!user || !user.taraBuddySettings || !user.taraBuddySettings.isTaraBuddyEnabled) {
      throw new Error("User or TaraBuddy settings not found");
    }

    const preferences = user.taraBuddySettings;
    const userAge = calculateAge(user.bdate);
    const userGender = user.gender;

    // Get user's already liked profile IDs
    const likedUsers = await TaraBuddyLikeModel.find({ likedBy: userId }).select("liked");
    const likedUserIds = likedUsers.map((like) => like.liked);

    // Build filter for users with TaraBuddy enabled
    const matchFilter: any = {
      _id: { $ne: userId, $nin: likedUserIds }, // Exclude self and already liked users
      "taraBuddySettings.isTaraBuddyEnabled": true,
    };

    // Get all potential matches
    const allMatches = await User.find(matchFilter).select(
      "_id fname lname username isProUser gender bdate profileImage bio"
    );

    // Separate into matched and unmatched
    const matchedUsers: ITaraBuddySearchResult[] = [];
    const unmatchedUsers: ITaraBuddySearchResult[] = [];

    allMatches.forEach((buddy: any) => {
      const buddyAge = calculateAge(buddy.bdate);
      const isGenderMatch =
        preferences.preferredGender === "All" || preferences.preferredGender === buddy.gender;
      const isAgeMatch =
        buddyAge >= preferences.preferredAgeRange![0] &&
        buddyAge <= preferences.preferredAgeRange![1];

      const buddyResult: ITaraBuddySearchResult = {
        userID: buddy._id.toString(),
        fname: buddy.fname,
        lname: buddy.lname || "",
        username: buddy.username,
        isProUser: buddy.isProUser,
        gender: buddy.gender,
        bdate: buddy.bdate,
        profileImage: buddy.profileImage,
        bio: buddy.bio,
      };

      if (isGenderMatch && isAgeMatch) {
        matchedUsers.push(buddyResult);
      } else {
        unmatchedUsers.push(buddyResult);
      }
    });

    // Combine: matched first, then unmatched
    const results = [...matchedUsers, ...unmatchedUsers];

    console.log(
      "✅ Found",
      results.length,
      "TaraBuddy matches for user:",
      userId,
      `(${matchedUsers.length} matched, ${unmatchedUsers.length} unmatched)`
    );
    return results;
  } catch (error) {
    console.error("❌ Error searching TaraBuddies:", error);
    throw error;
  }
};

/**
 * Like a TaraBuddy user
 * Checks for existing like, creates new like, and checks for mutual match
 */
export const likeTaraBuddyService = async (
  currentUserId: string,
  likedUserId: string
): Promise<{
  success: boolean;
  match: boolean;
  message: string;
  matchedWith?: string;
  matchedFname?: string;
}> => {
  try {
    console.log("🟡 likeTaraBuddyService - User:", currentUserId, "liked user:", likedUserId);

    // Check if current user already liked this user
    const existingLike = await TaraBuddyLikeModel.findOne({
      likedBy: currentUserId,
      liked: likedUserId,
    });

    if (existingLike) {
      console.log("❌ User already liked:", likedUserId);
      return {
        success: false,
        match: false,
        message: "User already liked",
      };
    }

    // Check if the other user already liked the current user
    const reciprocalLike = await TaraBuddyLikeModel.findOne({
      likedBy: likedUserId,
      liked: currentUserId,
    });

    // Create new like record
    const newLike = new TaraBuddyLikeModel({
      likedBy: currentUserId,
      liked: likedUserId,
      isMatch: !!reciprocalLike, // Set to true if reciprocal like exists
      createdOn: new Date(),
    });

    await newLike.save();

    // If reciprocal like exists, update both records to isMatch = true
    if (reciprocalLike) {
      reciprocalLike.isMatch = true;
      reciprocalLike.save();

      // Get the liked user's info for the response
      const likedUser = await User.findById(likedUserId).select("fname");

      console.log("✅ Match created between", currentUserId, "and", likedUserId);
      return {
        success: true,
        match: true,
        message: `You matched with ${likedUser?.fname || "someone"}`,
        matchedWith: likedUserId,
        matchedFname: likedUser?.fname || "",
      };
    }

    console.log("✅ User liked successfully:", likedUserId);
    return {
      success: true,
      match: false,
      message: "User liked",
    };
  } catch (error) {
    console.error("❌ Error liking TaraBuddy:", error);
    throw error;
  }
};

/**
 * Update gender preference
 */
export const updateGenderPreferenceService = async (
  userId: string,
  preference: string
) => {
  try {
    console.log(
      "🟡 updateGenderPreferenceService - Updating gender preference for user:",
      userId,
      "to:",
      preference
    );

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.taraBuddySettings) {
      throw new Error("TaraBuddy settings not initialized");
    }

    user.taraBuddySettings.preferredGender = preference;
    user.updatedOn = new Date();

    const updatedUser = await user.save();

    console.log("✅ Gender preference updated successfully");
    return updatedUser;
  } catch (error) {
    console.error("❌ Error updating gender preference:", error);
    throw error;
  }
};

/**
 * Update distance preference
 */
export const updateDistancePreferenceService = async (
  userId: string,
  preference: number
) => {
  try {
    console.log(
      "🟡 updateDistancePreferenceService - Updating distance preference for user:",
      userId,
      "to:",
      preference
    );

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.taraBuddySettings) {
      throw new Error("TaraBuddy settings not initialized");
    }

    user.taraBuddySettings.preferredDistance = preference;
    user.updatedOn = new Date();

    const updatedUser = await user.save();

    console.log("✅ Distance preference updated successfully");
    return updatedUser;
  } catch (error) {
    console.error("❌ Error updating distance preference:", error);
    throw error;
  }
};

/**
 * Update age range preference
 */
export const updateAgePreferenceService = async (
  userId: string,
  preference: [number, number]
) => {
  try {
    console.log(
      "🟡 updateAgePreferenceService - Updating age preference for user:",
      userId,
      "to:",
      preference
    );

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.taraBuddySettings) {
      throw new Error("TaraBuddy settings not initialized");
    }

    user.taraBuddySettings.preferredAgeRange = preference;
    user.updatedOn = new Date();

    const updatedUser = await user.save();

    console.log("✅ Age preference updated successfully");
    return updatedUser;
  } catch (error) {
    console.error("❌ Error updating age preference:", error);
    throw error;
  }
};

/**
 * Update zodiac preference
 */
export const updateZodiacPreferenceService = async (
  userId: string,
  preference: string[]
) => {
  try {
    console.log(
      "🟡 updateZodiacPreferenceService - Updating zodiac preference for user:",
      userId,
      "to:",
      preference
    );

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.taraBuddySettings) {
      throw new Error("TaraBuddy settings not initialized");
    }

    user.taraBuddySettings.preferredZodiac = preference;
    user.updatedOn = new Date();

    const updatedUser = await user.save();

    console.log("✅ Zodiac preference updated successfully");
    return updatedUser;
  } catch (error) {
    console.error("❌ Error updating zodiac preference:", error);
    throw error;
  }
};

/**
 * Get all matches for a user
 * Returns users that have a mutual match with the current user
 */
export const getMatchesService = async (
  userId: string
): Promise<
  Array<{
    userID: string;
    fname: string;
    lname: string;
    gender: string;
    age: number;
  }>
> => {
  try {
    console.log("🟡 getMatchesService - Getting matches for user:", userId);

    // Find all mutual matches (where isMatch = true)
    const matches = await TaraBuddyLikeModel.find({
      $or: [{ likedBy: userId }, { liked: userId }],
      isMatch: true,
    });

    if (matches.length === 0) {
      console.log("ℹ️ No matches found for user:", userId);
      return [];
    }

    // Get matched user IDs
    const matchedUserIds = matches.map((match) => {
      return match.likedBy === userId ? match.liked : match.likedBy;
    });

    // Fetch user details for all matched users
    const matchedUsers = await User.find({ _id: { $in: matchedUserIds } }).select(
      "_id fname lname gender bdate profileImage"
    );

    // Format response
    const result = matchedUsers.map((user: any) => ({
      userID: user._id.toString(),
      fname: user.fname,
      lname: user.lname || "",
      gender: user.gender,
      age: calculateAge(user.bdate),
      profileImage: user.profileImage,
    }));

    console.log("✅ Found", result.length, "matches for user:", userId);
    return result;
  } catch (error) {
    console.error("❌ Error getting matches:", error);
    throw error;
  }
};

/**
 * Unmatch two users
 * Deletes the match records between two users
 */
export const unmatchService = async (
  currentUserId: string,
  userIdToUnmatch: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log("🟡 unmatchService - User:", currentUserId, "unmatching with:", userIdToUnmatch);

    if (!userIdToUnmatch) {
      throw new Error("User ID to unmatch is required");
    }

    // Find and delete both directions of the match
    const deleteResult = await TaraBuddyLikeModel.deleteMany({
      $or: [
        { likedBy: currentUserId, liked: userIdToUnmatch },
        { likedBy: userIdToUnmatch, liked: currentUserId },
      ],
    });

    if (deleteResult.deletedCount === 0) {
      console.log("❌ No match found between users");
      return {
        success: false,
        message: "No match found between these users",
      };
    }

    console.log("✅ Users unmatched successfully. Deleted", deleteResult.deletedCount, "records");
    return {
      success: true,
      message: "Users unmatched successfully",
    };
  } catch (error) {
    console.error("❌ Error unmatching users:", error);
    throw error;
  }
};

/**
 * Calculate age from birth date
 */
const calculateAge = (bdate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - bdate.getFullYear();
  const monthDiff = today.getMonth() - bdate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bdate.getDate())) {
    age--;
  }

  return age;
};
