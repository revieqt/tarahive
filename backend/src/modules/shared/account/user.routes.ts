import express from 'express';
import { updateBooleanUserData, updateStringUserData, uploadProfileImage, updateUserLikes, searchOtherUser, searchUsers, requestLogsExport } from './user.controller';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { upload, processProfileImage } from '../../../middleware/uploadMiddleware';

const router = express.Router();

// Update boolean user data (visibilitySettings, securitySettings, etc.)
router.patch('/update-boolean', authMiddleware, updateBooleanUserData);

// Update string user data (fname, lname, bio, etc.)
router.patch('/update-string', authMiddleware, updateStringUserData);

// Upload profile image
router.post('/upload-profile-image', authMiddleware, upload.single('image'), processProfileImage, uploadProfileImage);

// Update user likes and optionally isFirstLogin
router.patch('/update-likes', authMiddleware, updateUserLikes);

// Search for users by fname, lname, or username (query parameter route must come first)
router.get('/search', authMiddleware, searchUsers);

// Search for another user by username or ID
router.get('/search/:identifier', authMiddleware, searchOtherUser);

// Request logs export (generates CSV and sends via email)
router.post('/request-logs', authMiddleware, requestLogsExport);

export default router;
