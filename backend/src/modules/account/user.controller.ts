import { Request, Response } from 'express';
import { updateBooleanFieldService, updateStringFieldService, updateProfileImageWithCleanup, updateUserLikesService, searchOtherUserService, requestLogsExportService, searchUsersService } from './user.service';

interface AuthRequest extends Request {
  user?: any;
}

export const updateBooleanUserData = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔵 updateBooleanUserData - req.user:', req.user);
    const { userId, fieldName, value } = req.body;

    console.log('🔵 Received:', { userId, fieldName, value });

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!fieldName || typeof fieldName !== 'string') {
      return res.status(400).json({ message: 'Invalid fieldName provided' });
    }

    if (typeof value !== 'boolean') {
      return res.status(400).json({ message: 'Value must be a boolean' });
    }

    const result = await updateBooleanFieldService(userId, fieldName, value);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('🔵 Result from service:', result);
    
    // Remove flat dot-notation keys from result (they shouldn't be in the response)
    // Keep only properly nested structure
    const cleanedResult: any = {};
    for (const key in result) {
      if (!key.includes('.')) {
        cleanedResult[key] = result[key];
      }
    }
    
    console.log('🔵 Cleaned result:', cleanedResult);
    res.status(200).json({
      message: 'Boolean field updated successfully',
      data: cleanedResult
    });
  } catch (error) {
    console.error('❌ Error updating boolean user data:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateStringUserData = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 updateStringUserData - req.user:', req.user);
    const { userId, fieldName, value } = req.body;

    console.log('🟡 Received:', { userId, fieldName, value });

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!fieldName || typeof fieldName !== 'string') {
      return res.status(400).json({ message: 'Invalid fieldName provided' });
    }

    if (typeof value !== 'string') {
      return res.status(400).json({ message: 'Value must be a string' });
    }

    const result = await updateStringFieldService(userId, fieldName, value);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'String field updated successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error updating string user data:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🖼️ uploadProfileImage - req.user:', req.user);
    const { userId } = req.body;
    const imagePath = (req as any).processedImagePath;

    console.log('🖼️ Received:', { userId, imagePath });

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!imagePath) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Update user's profileImage field and delete old image
    const result = await updateProfileImageWithCleanup(userId, imagePath);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error uploading profile image:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateUserLikes = async (req: AuthRequest, res: Response) => {
  try {
    console.log('❤️ updateUserLikes - req.user:', req.user);
    const { likes, isFirstLoginValue } = req.body;
    const userId = req.user?.id || req.user?.userId;

    console.log('❤️ Received:', { userId, likes, isFirstLoginValue });

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!Array.isArray(likes)) {
      return res.status(400).json({ message: 'Likes must be an array of strings' });
    }

    // Validate that all items in likes array are strings
    if (!likes.every(item => typeof item === 'string')) {
      return res.status(400).json({ message: 'All items in likes array must be strings' });
    }

    // Optional: validate isFirstLoginValue if provided
    if (typeof isFirstLoginValue !== 'undefined' && typeof isFirstLoginValue !== 'boolean') {
      return res.status(400).json({ message: 'isFirstLoginValue must be a boolean if provided' });
    }

    const result = await updateUserLikesService(userId, likes, isFirstLoginValue);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User likes updated successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error updating user likes:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const searchOtherUser = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 searchOtherUser - req.user:', req.user);
    const { identifier } = req.params;
    const identifierStr = (Array.isArray(identifier) ? identifier[0] : identifier) as string;

    console.log('🔍 Search identifier:', identifierStr);

    if (!identifierStr) {
      return res.status(400).json({ message: 'Identifier (username or ID) is required' });
    }

    const result = await searchOtherUserService(identifierStr);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User found',
      data: result
    });
  } catch (error) {
    console.error('❌ Error searching for user:', error);
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Search for users by fname, lname, or username
 * GET /api/users/search?q=searchString
 */
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 searchUsers - req.user:', req.user);
    const { q } = req.query;
    const searchQuery = (Array.isArray(q) ? q[0] : q) as string;
    const currentUserId = req.user?._id;

    console.log('🔍 Search query:', searchQuery);

    if (!searchQuery) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const users = await searchUsersService(searchQuery, currentUserId);

    res.status(200).json({
      success: true,
      message: 'Users found',
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const requestLogsExport = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📊 requestLogsExport - req.user:', req.user);
    const { startDate, endDate } = req.body;

    // Extract userId and email from authenticated request (via authMiddleware)
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      console.warn('⚠️ No authenticated user found');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    console.log('📊 Received:', { userId, startDate, endDate });

    // Validate request body
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both startDate and endDate are required',
      });
    }

    // Validate date formats
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)',
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'startDate must be before or equal to endDate',
      });
    }

    // Call service to enqueue the job
    const job = await requestLogsExportService(userId, start, end, req);

    console.log(`✅ Logs export job ${job.id} enqueued for user ${userId}`);

    // Return immediate response to frontend (job is processing in background)
    return res.status(200).json({
      success: true,
      message: 'Logs export request received. You will receive the CSV file via email shortly.',
      jobId: job.id,
    });
  } catch (error) {
    console.error('❌ Error in requestLogsExport:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to request logs export';
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

