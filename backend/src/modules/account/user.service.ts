import User from './account.model';
import { Types } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { addLogsExportJob } from './logs-export.queue';
import { Request } from 'express';

/**
 * Update a boolean field in the user document
 * Supports nested fields using dot notation (e.g., "visibilitySettings.isProfilePublic")
 * Returns only the affected field (not full user document) to reduce latency
 */
export const updateBooleanFieldService = async (
  userId: string,
  fieldName: string,
  value: boolean
) => {
  try {
    console.log(`🔵 updateBooleanFieldService - userId: ${userId}, fieldName: ${fieldName}, value: ${value}`);
    
    // Validate that fieldName follows expected patterns
    const allowedFields = [
      'isFirstLogin',
      'isProUser',
      'safetyState.isInAnEmergency',
      'visibilitySettings.isProfilePublic',
      'visibilitySettings.isPersonalInfoPublic',
      'visibilitySettings.isTravelInfoPublic',
      'securitySettings.is2FAEnabled',
      'taraBuddySettings.isTaraBuddyEnabled'
    ];

    if (!allowedFields.includes(fieldName)) {
      throw new Error(`Invalid field name: ${fieldName}`);
    }

    const updateData: any = {};
    updateData[fieldName] = value;

    console.log(`🔵 Update data:`, updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`🔵 Updated user:`, updatedUser);
    
    // Return only the affected field (not full user document)
    // For nested fields (e.g., "visibilitySettings.isProfilePublic"), create the nested structure
    const affectedFields: any = {};
    
    console.log(`🔵 fieldName: "${fieldName}", includes dot: ${fieldName.includes('.')}`);
    
    if (fieldName.includes('.')) {
      // Handle nested fields
      console.log(`🔵 Processing nested field`);
      const parts = fieldName.split('.');
      console.log(`🔵 Parts:`, parts);
      let current = affectedFields;
      for (let i = 0; i < parts.length - 1; i++) {
        console.log(`🔵 Creating nested key: ${parts[i]}`);
        current[parts[i]] = {};
        current = current[parts[i]];
      }
      const lastPart = parts[parts.length - 1];
      console.log(`🔵 Setting final key: ${lastPart} = ${value}`);
      current[lastPart] = value;
    } else {
      // Handle flat fields
      console.log(`🔵 Processing flat field`);
      affectedFields[fieldName] = value;
    }
    
    console.log(`🔵 Returning only affected fields:`, affectedFields);
    return affectedFields;
  } catch (error) {
    console.error(`❌ Error updating boolean field ${fieldName}:`, error);
    throw error;
  }
};

/**
 * Update a string field in the user document
 * Supports nested fields using dot notation if needed
 * Returns only the affected field (not full user document) to reduce latency
 */
export const updateStringFieldService = async (
  userId: string,
  fieldName: string,
  value: string
) => {
  try {
    console.log(`🟡 updateStringFieldService - userId: ${userId}, fieldName: ${fieldName}, value: ${value}`);
    
    // Validate that fieldName follows expected patterns
    const allowedFields = [
      'fname',
      'lname',
      'bio',
      'contactNumber',
      'status',
      'profileImage',
      'safetyState.emergencyType',
      'safetyState.emergencyContact',
      'taraBuddySettings.preferredGender'
    ];

    if (!allowedFields.includes(fieldName)) {
      throw new Error(`Invalid field name: ${fieldName}`);
    }

    const updateData: any = {};
    updateData[fieldName] = value;

    console.log(`🟡 Update data:`, updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`🟡 Updated user:`, updatedUser);
    
    // Return only the affected field (not full user document)
    // For nested fields (e.g., "safetyState.emergencyType"), create the nested structure
    const affectedFields: any = {};
    
    console.log(`🟡 fieldName: "${fieldName}", includes dot: ${fieldName.includes('.')}`);
    
    if (fieldName.includes('.')) {
      // Handle nested fields
      console.log(`🟡 Processing nested field`);
      const parts = fieldName.split('.');
      console.log(`🟡 Parts:`, parts);
      let current = affectedFields;
      for (let i = 0; i < parts.length - 1; i++) {
        console.log(`🟡 Creating nested key: ${parts[i]}`);
        current[parts[i]] = {};
        current = current[parts[i]];
      }
      const lastPart = parts[parts.length - 1];
      console.log(`🟡 Setting final key: ${lastPart} = ${value}`);
      current[lastPart] = value;
    } else {
      // Handle flat fields
      console.log(`🟡 Processing flat field`);
      affectedFields[fieldName] = value;
    }
    
    console.log(`🟡 Returning only affected fields:`, affectedFields);
    return affectedFields;
  } catch (error) {
    console.error(`❌ Error updating string field ${fieldName}:`, error);
    throw error;
  }
};

/**
 * Delete a profile image file from the uploads folder
 * @param imagePath - The relative path to the image (e.g., /uploads/profileImages/timestamp_userId.jpg)
 */
export const deleteProfileImageFile = (imagePath: string): boolean => {
  try {
    if (!imagePath || imagePath === '') {
      console.log('🖼️ No image to delete');
      return true;
    }

    // Extract the filename from the path
    const filename = path.basename(imagePath);
    const fullPath = path.join(__dirname, '../../uploads/profileImages', filename);

    // Check if file exists and delete it
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🖼️ Deleted old profile image: ${fullPath}`);
      return true;
    } else {
      console.log(`🖼️ Old profile image not found: ${fullPath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error deleting profile image:`, error);
    // Don't throw, just log - we don't want to fail the entire operation
    return false;
  }
};

/**
 * Update user's profile image and delete the old one
 * Returns only the profileImage field (not full user document) to reduce latency
 * @param userId - User ID
 * @param newImagePath - The new image path
 */
export const updateProfileImageWithCleanup = async (
  userId: string,
  newImagePath: string
) => {
  try {
    console.log(`🖼️ updateProfileImageWithCleanup - userId: ${userId}, newImagePath: ${newImagePath}`);

    // Get current user to retrieve old image path
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldImagePath = user.profileImage;

    // Delete old image file if it exists
    if (oldImagePath && oldImagePath !== '') {
      deleteProfileImageFile(oldImagePath);
    }

    // Update user with new image path
    user.profileImage = newImagePath;
    await user.save();

    console.log(`🖼️ Profile image updated successfully`);
    
    // Return only the affected field (not full user document)
    console.log(`🖼️ Returning only affected fields: { profileImage: ${newImagePath} }`);
    return { profileImage: newImagePath };
  } catch (error) {
    console.error(`❌ Error updating profile image with cleanup:`, error);
    throw error;
  }
};

/**
 * Update user's likes array and optionally isFirstLogin field
 * Returns only the affected fields (not full user document) to reduce latency
 * @param userId - User ID
 * @param likes - Array of category strings that user likes
 * @param isFirstLoginValue - Optional boolean to update isFirstLogin field
 */
export const updateUserLikesService = async (
  userId: string,
  likes: string[],
  isFirstLoginValue?: boolean
) => {
  try {
    console.log(`❤️ updateUserLikesService - userId: ${userId}, likes: ${likes}, isFirstLoginValue: ${isFirstLoginValue}`);

    if (!Array.isArray(likes)) {
      throw new Error('Likes must be an array of strings');
    }

    const updateData: any = {
      likes: likes
    };

    // If isFirstLoginValue is provided, update it
    if (typeof isFirstLoginValue === 'boolean') {
      updateData.isFirstLogin = isFirstLoginValue;
      console.log(`❤️ Updating isFirstLogin to: ${isFirstLoginValue}`);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    console.log(`❤️ User likes updated successfully`);
    
    // Return only the affected fields (not full user document)
    const affectedFields: any = { likes: updatedUser.likes };
    if (typeof isFirstLoginValue === 'boolean') {
      affectedFields.isFirstLogin = updatedUser.isFirstLogin;
    }
    console.log(`❤️ Returning only affected fields:`, affectedFields);
    return affectedFields;
  } catch (error) {
    console.error(`❌ Error updating user likes:`, error);
    throw error;
  }
};

/**
 * Search for another user by username or ID
 * Returns limited public information about the user
 * @param identifier - Username or User ID
 */
export const searchOtherUserService = async (identifier: string) => {
  try {
    console.log(`🔍 searchOtherUserService - identifier: ${identifier}`);

    if (!identifier || typeof identifier !== 'string') {
      throw new Error('Identifier must be a non-empty string');
    }

    // Build query - search by username always, and by ID only if valid ObjectId
    let query: any = { username: identifier.toLowerCase() };
    
    // Check if identifier is a valid MongoDB ObjectId
    if (Types.ObjectId.isValid(identifier)) {
      query = {
        $or: [
          { username: identifier.toLowerCase() },
          { _id: new Types.ObjectId(identifier) }
        ]
      };
    }

    // Search by username or ID
    const user = await User.findOne(query).select(
      'fname lname username type expPoints likes gender bdate isProUser profileImage visibilitySettings'
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate age from birthdate
    const birthDate = new Date(user.bdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    console.log(`🔍 User found: ${user.username}`);

    // Return public user information
    return {
      fname: user.fname,
      lname: user.lname,
      username: user.username,
      type: user.type,
      expPoints: user.expPoints,
      likes: user.likes,
      gender: user.gender,
      age: age,
      bdate: user.bdate,
      isProUser: user.isProUser,
      profileImage: user.profileImage,
      visibilitySettings: user.visibilitySettings
    };
  } catch (error) {
    console.error(`❌ Error searching for user:`, error);
    throw error;
  }
};

/**
 * Request an export of user's logs as CSV
 * Enqueues a job to process the logs export and send via email
 * @param userId - User ID
 * @param startDate - Start date for logs
 * @param endDate - End date for logs
 * @param req - Express request object to get user email
 */
export const requestLogsExportService = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  req: Request
) => {
  try {
    console.log(`📊 requestLogsExportService - userId: ${userId}, startDate: ${startDate}, endDate: ${endDate}`);

    // Get user from database to retrieve email
    const user = await User.findById(userId).select('email fname lname');
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.email) {
      throw new Error('User email not found');
    }

    console.log(`📊 User email retrieved: ${user.email}`);

    // Add job to the queue for background processing
    const job = await addLogsExportJob({
      userId,
      email: user.email,
      startDate,
      endDate,
    });

    console.log(`📊 Logs export job added to queue: ${job.id}`);
    return job;
  } catch (error) {
    console.error(`❌ Error in requestLogsExportService:`, error);
    throw error;
  }
};

/**
 * Search for users by fname, lname, or username
 * Returns a list of matching users with limited fields
 */
export const searchUsersService = async (searchQuery: string, currentUserId?: string) => {
  try {
    console.log(`🔍 searchUsersService - query: ${searchQuery}, excludeUserId: ${currentUserId}`);

    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length === 0) {
      throw new Error('Search query must be a non-empty string');
    }

    // Create case-insensitive regex pattern
    const searchPattern = new RegExp(searchQuery.trim(), 'i');

    // Build search filter
    const searchFilter: any = {
      $or: [
        { fname: searchPattern },
        { lname: searchPattern },
        { username: searchPattern }
      ]
    };

    // Exclude current user if provided
    if (currentUserId) {
      searchFilter._id = { $ne: currentUserId };
    }

    // Search in fname, lname, and username
    const users = await User.find(searchFilter).select('_id profileImage fname lname').limit(20);

    console.log(`✅ Found ${users.length} users matching query: ${searchQuery}`);

    // Format response
    const results = users.map((user: any) => ({
      userID: user._id.toString(),
      profileImage: user.profileImage,
      fname: user.fname,
      lname: user.lname,
    }));

    return results;
  } catch (error) {
    console.error(`❌ Error searching users:`, error);
    throw error;
  }
};
