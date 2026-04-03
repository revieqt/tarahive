import { BACKEND_URL } from "@/constants/Config";

/**
 * Update user profile image
 * @param accessToken - User's access token
 * @param userId - User's ID
 * @param file - Image file to upload
 * @returns Profile image path from backend
 */
export const updateProfileImage = async (accessToken: string, userId: string, file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", userId);

    const response = await fetch(`${BACKEND_URL}/api/users/upload-profile-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update profile image: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.profileImage; // Returns only the profile image path string
  } catch (error) {
    console.error("Error updating profile image:", error);
    throw error;
  }
};
