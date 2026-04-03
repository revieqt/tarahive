import jwt from 'jsonwebtoken';
import { RoomModel, IRoom } from './room.model';
import { ItineraryModel } from '../itinerary/itinerary.model';
import User from '../account/account.model';
import fs from 'fs';
import path from 'path';

/**
 * Generate a random 6-character alphanumeric invite code
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Decode JWT token and extract userID
 */
const decodeTokenAndGetUserID = (token: string): string => {
  try {
    const secretKey = process.env.JWT_SECRET || 'default_secret';
    const decoded: any = jwt.verify(token, secretKey);
    if (!decoded.userId) {
      throw new Error('Invalid token: userId not found');
    }
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * A. Get all rooms that the user is a member of
 * Returns: { id, name, roomImage?, memberCount }
 * Status filter: 'member' (default), 'invited', 'waiting'
 */
export const getRoomsService = async (accessToken: string, status: string = 'member') => {
  try {
    console.log(`🔵 getRoomsService - Decoding token with status filter: ${status}`);
    const userID = decodeTokenAndGetUserID(accessToken);
    console.log(`🔵 getRoomsService - UserID: ${userID}`);

    // Validate status parameter - support comma-separated values
    const validStatuses = ['member', 'invited', 'waiting'];
    const requestedStatuses = status.split(',').map(s => s.trim());
    const targetStatuses = requestedStatuses.filter(s => validStatuses.includes(s));
    
    // Default to 'member' if no valid statuses provided
    const statusesToQuery = targetStatuses.length > 0 ? targetStatuses : ['member'];

    const rooms = await RoomModel.find({
      'members': {
        $elemMatch: {
          userID: userID,
          status: { $in: statusesToQuery },
        },
      },
    }).select('_id name roomImage members');

    console.log(`🔵 getRoomsService - Found ${rooms.length} rooms with status '${statusesToQuery.join(', ')}'`);

    const formattedRooms = rooms.map((room) => {
      const userMembership = room.members.find((m: any) => m.userID === userID);
      return {
        id: room._id,
        name: room.name,
        ...(room.roomImage && { roomImage: room.roomImage }),
        memberCount: room.members.length,
        membershipStatus: userMembership?.status,
      };
    });

    return formattedRooms;
  } catch (error) {
    console.error('❌ Error in getRoomsService:', error);
    throw error;
  }
};

/**
 * B. Get specific room details
 * Returns: { name, inviteCode, roomImage?, roomColor, itineraryID?, itineraryTitle?, itineraryStartDate?, itineraryEndDate?, chatID, admins, members }
 */
export const getSpecificRoomService = async (accessToken: string, roomID: string) => {
  try {
    console.log(`🔵 getSpecificRoomService - Decoding token and fetching room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);
    console.log(`🔵 getSpecificRoomService - UserID: ${userID}`);

    const room = await RoomModel.findById(roomID);

    if (!room) {
      throw new Error('Room not found');
    }

    // Check if user is a member of the room
    const isMember = room.members.some((m) => m.userID === userID);

    let formattedMembers = [];
    let chatID = room.chatID;

    // Only return members list and chatID if user is a member
    if (isMember) {
      console.log(`🔵 getSpecificRoomService - User is a member, fetching member details`);

      // Get user information for members
      const memberUserIDs = [...new Set(room.members.map((m) => m.userID))];
      const users: any[] = await User.find({ _id: { $in: memberUserIDs } }).select('_id username profileImage');
      const userMap = new Map(users.map((u) => [u._id.toString(), { username: u.username, profileImage: u.profileImage }]));

      formattedMembers = room.members.map((m) => ({
        userID: m.userID,
        ...(m.nickname && { nickname: m.nickname }),
        username: userMap.get(m.userID.toString())?.username || 'Unknown',
        profileImage: userMap.get(m.userID.toString())?.profileImage,
        joinedOn: m.joinedOn,
        status: m.status,
      }));
    } else {
      console.log(`🔵 getSpecificRoomService - User is not a member, returning limited room details`);
      chatID = ''; // Don't return chatID for non-members
    }

    const response: any = {
      _id: room._id,
      name: room.name,
      inviteCode: room.inviteCode,
      ...(room.roomImage && { roomImage: room.roomImage }),
      roomColor: room.roomColor,
      ...(chatID && { chatID: chatID }),
      ...(isMember && { admins: room.admins }),
      members: formattedMembers,
    };

    // Add itinerary details if itineraryID exists
    if (room.itineraryID) {
      response.itineraryID = room.itineraryID;
      try {
        const itinerary = await ItineraryModel.findById(room.itineraryID).select(
          'title startDate endDate'
        );
        if (itinerary) {
          response.itineraryTitle = itinerary.title;
          response.itineraryStartDate = itinerary.startDate;
          response.itineraryEndDate = itinerary.endDate;
        }
      } catch (err) {
        console.warn('⚠️ Failed to fetch itinerary details:', err);
      }
    }

    return response;
  } catch (error) {
    console.error('❌ Error in getSpecificRoomService:', error);
    throw error;
  }
};

/**
 * C. Create a new room
 * The user who creates the room becomes the admin and a member
 */
export const createRoomService = async (
  accessToken: string,
  name: string,
  invitedMembers?: string[],
  itineraryID?: string
) => {
  try {
    console.log('🔵 createRoomService - Decoding token');
    const userID = decodeTokenAndGetUserID(accessToken);
    console.log(`🔵 createRoomService - UserID: ${userID}, Room name: ${name}`);

    // Validate room name
    if (!name || name.trim().length === 0) {
      throw new Error('Room name is required');
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let codeExists = true;
    while (codeExists) {
      const existing = await RoomModel.findOne({ inviteCode });
      if (!existing) {
        codeExists = false;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    console.log(`🔵 createRoomService - Generated invite code: ${inviteCode}`);

    // Create initial members array with the creator
    const members: any[] = [
      {
        userID,
        joinedOn: new Date(),
        status: 'member',
      },
    ];

    // Add invited members if provided
    if (invitedMembers && Array.isArray(invitedMembers) && invitedMembers.length > 0) {
      for (const memberID of invitedMembers) {
        // Check if member already exists
        if (!members.some((m) => m.userID === memberID)) {
          members.push({
            userID: memberID,
            joinedOn: new Date(),
            status: 'invited',
          });
        }
      }
    }

    // Create room object with all fields initialized
    const roomData: any = {
      name: name.trim(),
      createdOn: new Date(),
      updatedOn: new Date(),
      inviteCode,
      roomImage: '',
      roomColor: '#00CAFF',
      itineraryID: itineraryID || '',
      chatID: '',
      admins: [userID],
      members,
    };

    console.log(`🔵 createRoomService - Room data initialized:`, roomData);

    const newRoom = await RoomModel.create(roomData);

    console.log(`🔵 createRoomService - Room created with ID: ${newRoom._id}`);

    // Get user information for members
    const memberUserIDs = [...new Set(newRoom.members.map((m) => m.userID))];
    const users: any[] = await User.find({ _id: { $in: memberUserIDs } }).select('_id username');
    const userMap = new Map(users.map((u) => [u._id.toString(), u.username]));

    const formattedMembers = newRoom.members.map((m) => ({
      userID: m.userID,
      ...(m.nickname && { nickname: m.nickname }),
      username: userMap.get(m.userID.toString()) || 'Unknown',
      joinedOn: m.joinedOn,
      status: m.status,
    }));

    const response: any = {
      id: newRoom._id,
      name: newRoom.name,
      inviteCode: newRoom.inviteCode,
      roomImage: newRoom.roomImage,
      roomColor: newRoom.roomColor,
      itineraryID: newRoom.itineraryID,
      chatID: newRoom.chatID,
      admins: newRoom.admins,
      members: formattedMembers,
    };

    return response;
  } catch (error) {
    console.error('❌ Error in createRoomService:', error);
    throw error;
  }
};

/**
 * D. Leave a room
 * - If user is admin and no other admins exist, return error
 * - If user is last member, delete the room
 */
export const leaveRoomService = async (accessToken: string, roomID: string) => {
  try {
    console.log(`🔵 leaveRoomService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);
    console.log(`🔵 leaveRoomService - UserID: ${userID}`);

    const room = await RoomModel.findById(roomID);

    if (!room) {
      throw new Error('Room not found');
    }

    // Verify user is a member of the room
    const memberIndex = room.members.findIndex((m) => m.userID === userID);
    if (memberIndex === -1) {
      throw new Error('User is not a member of this room');
    }

    console.log(`🔵 leaveRoomService - User found in room, checking admin status`);

    // Check if user is admin
    const isAdmin = room.admins.includes(userID);

    if (isAdmin) {
      // Check if there are other admins
      const otherAdmins = room.admins.filter((adminID) => adminID !== userID);
      // Only throw error if they're the only admin AND there are other members
      const otherMembers = room.members.filter((m) => m.userID !== userID);
      if (otherAdmins.length === 0 && otherMembers.length > 0) {
        console.log('❌ leaveRoomService - User is only admin and there are other members');
        throw new Error(
          'You cannot leave the room as the only admin. Please assign another admin first.'
        );
      }
      console.log(`🔵 leaveRoomService - User is admin, checking if room will be empty after leaving`);
    }

    // Remove user from members
    room.members.splice(memberIndex, 1);

    // Remove user from admins if they were an admin
    if (isAdmin) {
      room.admins = room.admins.filter((adminID) => adminID !== userID);
      console.log(`🔵 leaveRoomService - User removed from admins`);
    }

    // Check if room is now empty
    if (room.members.length === 0) {
      console.log(`🔵 leaveRoomService - Room is empty, deleting room`);
      await RoomModel.findByIdAndDelete(roomID);
      return {
        success: true,
        message: 'You have left the room. The room has been deleted as it has no members.',
        roomDeleted: true,
      };
    }

    // Save updated room
    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 leaveRoomService - User successfully left the room`);
    return {
      success: true,
      message: 'You have left the room successfully.',
      roomDeleted: false,
    };
  } catch (error) {
    console.error('❌ Error in leaveRoomService:', error);
    throw error;
  }
};

/**
 * F. Update room image
 * Deletes old image if exists and updates with new one
 */
export const updateRoomImageService = async (
  accessToken: string,
  roomID: string,
  newImagePath: string
) => {
  try {
    console.log(`🔵 updateRoomImageService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify user is an admin
    if (!room.admins.includes(userID)) {
      throw new Error('Only admins can update room image');
    }

    const oldImagePath = room.roomImage;

    // Delete old image if it exists
    if (oldImagePath && oldImagePath !== '') {
      try {
        // Extract filename from path (handle both '/uploads/roomImages/file.jpg' and 'uploads/roomImages/file.jpg')
        let filename = '';
        if (oldImagePath.startsWith('/uploads/roomImages/')) {
          filename = oldImagePath.replace('/uploads/roomImages/', '');
        } else if (oldImagePath.includes('/uploads/roomImages/')) {
          filename = oldImagePath.split('/uploads/roomImages/')[1];
        } else {
          // Try direct filename
          filename = path.basename(oldImagePath);
        }

        const fullPath = path.join(process.cwd(), 'uploads/roomImages', filename);
        console.log(`🔵 updateRoomImageService - Attempting to delete old image at: ${fullPath}`);
        
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`🔵 updateRoomImageService - Successfully deleted old room image: ${filename}`);
        } else {
          console.warn(`⚠️ updateRoomImageService - Old image file not found at: ${fullPath}`);
        }
      } catch (err) {
        console.warn('⚠️ updateRoomImageService - Failed to delete old room image:', err);
        // Don't throw, continue with update
      }
    }

    // Update room with new image path
    room.roomImage = newImagePath;
    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 updateRoomImageService - Room image updated successfully`);
  } catch (error) {
    console.error('❌ Error in updateRoomImageService:', error);
    throw error;
  }
};

/**
 * G. Update room color
 */
export const updateRoomColorService = async (
  accessToken: string,
  roomID: string,
  color: string
) => {
  try {
    console.log(`🔵 updateRoomColorService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify user is an admin
    if (!room.admins.includes(userID)) {
      throw new Error('Only admins can update room color');
    }

    // Validate color format (hex color)
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      throw new Error('Invalid color format. Use hex format (e.g., #00CAFF)');
    }

    room.roomColor = color;
    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 updateRoomColorService - Room color updated to ${color}`);
  } catch (error) {
    console.error('❌ Error in updateRoomColorService:', error);
    throw error;
  }
};

/**
 * E. Update room name
 */
export const updateRoomNameService = async (
  accessToken: string,
  roomID: string,
  name: string
) => {
  try {
    console.log(`🔵 updateRoomNameService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify user is an admin
    if (!room.admins.includes(userID)) {
      throw new Error('only admins can update room name');
    }

    // Validate room name
    if (!name || name.trim().length === 0) {
      throw new Error('Room name cannot be empty');
    }

    room.name = name.trim();
    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 updateRoomNameService - Room name updated to ${name}`);
  } catch (error) {
    console.error('❌ Error in updateRoomNameService:', error);
    throw error;
  }
};

/**
 * H. Update attached itinerary
 */
export const updateAttachedItineraryService = async (
  accessToken: string,
  roomID: string,
  itineraryID: string
) => {
  try {
    console.log(`🔵 updateAttachedItineraryService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify user is an admin
    if (!room.admins.includes(userID)) {
      throw new Error('Only admins can update attached itinerary');
    }

    // Verify itinerary exists
    const itinerary = await ItineraryModel.findById(itineraryID);
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    room.itineraryID = itineraryID;
    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 updateAttachedItineraryService - Room itinerary updated to ${itineraryID}`);
  } catch (error) {
    console.error('❌ Error in updateAttachedItineraryService:', error);
    throw error;
  }
};

/**
 * H1. Unattach itinerary from room
 */
export const unattachItineraryService = async (
  accessToken: string,
  roomID: string
) => {
  try {
    console.log(`🔵 unattachItineraryService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify user is an admin
    if (!room.admins.includes(userID)) {
      throw new Error('Only admins can unattach itinerary');
    }

    room.itineraryID = undefined;
    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 unattachItineraryService - Room itinerary unattached successfully`);
  } catch (error) {
    console.error('❌ Error in unattachItineraryService:', error);
    throw error;
  }
};

/**
 * I. Invite user to room
 */
export const inviteUserService = async (
  accessToken: string,
  roomID: string,
  targetUserID: string
) => {
  try {
    console.log(`🔵 inviteUserService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify user is an admin
    if (!room.admins.includes(userID)) {
      throw new Error('Only admins can invite users');
    }

    // Check if user already exists in room
    const memberExists = room.members.some((m) => m.userID === targetUserID);
    if (memberExists) {
      throw new Error('User is already a member of this room');
    }

    // Verify target user exists
    const targetUser = await User.findById(targetUserID);
    if (!targetUser) {
      throw new Error('User not found');
    }

    // Add user to members with 'invited' status
    room.members.push({
      userID: targetUserID,
      joinedOn: new Date(),
      status: 'invited',
    });

    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 inviteUserService - User ${targetUserID} invited to room`);
  } catch (error) {
    console.error('❌ Error in inviteUserService:', error);
    throw error;
  }
};

/**
 * J. Approve invite (change status from 'invited' to 'member')
 */
export const approveInviteService = async (
  accessToken: string,
  roomID: string,
  approval: boolean
) => {
  try {
    console.log(`🔵 approveInviteService - Decoding token for room ${roomID}, approval: ${approval}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Find the member who is invited
    const memberIndex = room.members.findIndex((m) => m.userID === userID);
    if (memberIndex === -1) {
      throw new Error('User is not a member of this room');
    }

    const member = room.members[memberIndex];
    if (member.status !== 'invited') {
      throw new Error('User is not in invited status');
    }

    if (approval) {
      // User accepted the invite - change status to 'member'
      member.status = 'member';
      member.joinedOn = new Date();
      console.log(`🔵 approveInviteService - User ${userID} accepted invite and became member`);
    } else {
      // User rejected the invite - remove from members
      room.members.splice(memberIndex, 1);
      console.log(`🔵 approveInviteService - User ${userID} rejected invite and removed from members`);
    }

    room.updatedOn = new Date();
    await room.save();
  } catch (error) {
    console.error('❌ Error in approveInviteService:', error);
    throw error;
  }
};

/**
 * K. Update user nickname in room
 */
export const updateNicknameService = async (
  accessToken: string,
  roomID: string,
  targetUserID: string,
  nickname: string
) => {
  try {
    console.log(`🔵 updateNicknameService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify requesting user is an admin
    if (!room.admins.includes(userID)) {
      throw new Error('Only admins can update nicknames');
    }

    // Find the member
    const member = room.members.find((m) => m.userID === targetUserID);
    if (!member) {
      throw new Error('User is not a member of this room');
    }

    // Update nickname (allow empty string to clear nickname)
    member.nickname = nickname.trim() || undefined;

    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 updateNicknameService - User nickname updated`);
  } catch (error) {
    console.error('❌ Error in updateNicknameService:', error);
    throw error;
  }
};

/**
 * L. Request to join a room
 * User requests to join a public room
 */
export const requestToJoinService = async (
  accessToken: string,
  roomID: string
) => {
  try {
    console.log(`🔵 requestToJoinService - Decoding token for room ${roomID}`);
    const userID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Check if user is already a member in any status
    const existingMember = room.members.find((m) => m.userID === userID);
    if (existingMember) {
      throw new Error('User is already a member of this room');
    }

    // Get user from users collection
    const user = await User.findById(userID).select('username fname lname');
    if (!user) {
      throw new Error('User not found');
    }

    // Use username as nickname, or fallback to fname if username is not available
    const displayName = user.username || user.fname || 'User';

    // Add user to members array with 'waiting' status
    room.members.push({
      userID: userID,
      nickname: displayName,
      joinedOn: new Date(),
      status: 'waiting',
    });

    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 requestToJoinService - User ${userID} requested to join room`);
  } catch (error) {
    console.error('❌ Error in requestToJoinService:', error);
    throw error;
  }
};

/**
 * M. Approve join request
 * Admin approves or rejects a user's join request
 */
export const approveJoinRequestService = async (
  accessToken: string,
  roomID: string,
  userID: string,
  approval: boolean
) => {
  try {
    console.log(`🔵 approveJoinRequestService - Decoding token for room ${roomID}, approval: ${approval}`);
    const adminID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify requesting user is an admin
    if (!room.admins.includes(adminID)) {
      throw new Error('Only admins can approve join requests');
    }

    // Find the member with 'waiting' status
    const memberIndex = room.members.findIndex((m) => m.userID === userID);
    if (memberIndex === -1) {
      throw new Error('User has not requested to join this room');
    }

    const member = room.members[memberIndex];
    if (member.status !== 'waiting') {
      throw new Error('User is not in waiting status');
    }

    if (approval) {
      // Admin approved - change status to 'member'
      member.status = 'member';
      console.log(`🔵 approveJoinRequestService - Admin ${adminID} approved join request for user ${userID}`);
    } else {
      // Admin rejected - remove from members
      room.members.splice(memberIndex, 1);
      console.log(`🔵 approveJoinRequestService - Admin ${adminID} rejected join request for user ${userID}`);
    }

    room.updatedOn = new Date();
    await room.save();
  } catch (error) {
    console.error('❌ Error in approveJoinRequestService:', error);
    throw error;
  }
};

/**
 * N. Change user nickname
 * Admin changes another user's nickname in the room
 */
export const changeUserNicknameService = async (
  accessToken: string,
  roomID: string,
  userID: string,
  nickname: string
) => {
  try {
    console.log(`🔵 changeUserNicknameService - Decoding token for room ${roomID}`);
    const adminID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify requesting user is an admin
    if (!room.admins.includes(adminID)) {
      throw new Error('Only admins can change user nicknames');
    }

    // Find the member to update
    const member = room.members.find((m) => m.userID === userID);
    if (!member) {
      throw new Error('User is not a member of this room');
    }

    // Update nickname (allow empty string to clear nickname)
    member.nickname = nickname.trim() || undefined;

    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 changeUserNicknameService - Nickname updated for user ${userID}`);
  } catch (error) {
    console.error('❌ Error in changeUserNicknameService:', error);
    throw error;
  }
};

/**
 * O. Kick user from room
 * Admin removes a user from the room
 */
export const kickUserService = async (
  accessToken: string,
  roomID: string,
  userID: string
) => {
  try {
    console.log(`🔵 kickUserService - Decoding token for room ${roomID}`);
    const adminID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify requesting user is an admin
    if (!room.admins.includes(adminID)) {
      throw new Error('Only admins can kick users');
    }

    // Cannot kick yourself
    if (adminID === userID) {
      throw new Error('Cannot kick yourself from the room');
    }

    // Find and remove the member
    const memberIndex = room.members.findIndex((m) => m.userID === userID);
    if (memberIndex === -1) {
      throw new Error('User is not a member of this room');
    }

    room.members.splice(memberIndex, 1);

    // Also remove from admins if they were an admin
    const adminIndex = room.admins.indexOf(userID);
    if (adminIndex > -1) {
      room.admins.splice(adminIndex, 1);
    }

    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 kickUserService - User ${userID} kicked from room`);
  } catch (error) {
    console.error('❌ Error in kickUserService:', error);
    throw error;
  }
};

/**
 * P. Elevate user to admin
 * Admin grants admin privileges to another user
 */
export const elevateToAdminService = async (
  accessToken: string,
  roomID: string,
  userID: string
) => {
  try {
    console.log(`🔵 elevateToAdminService - Decoding token for room ${roomID}`);
    const adminID = decodeTokenAndGetUserID(accessToken);

    const room = await RoomModel.findById(roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify requesting user is an admin
    if (!room.admins.includes(adminID)) {
      throw new Error('Only admins can elevate users');
    }

    // Verify user is a member
    const member = room.members.find((m) => m.userID === userID);
    if (!member) {
      throw new Error('User is not a member of this room');
    }

    // Check if already an admin
    if (room.admins.includes(userID)) {
      throw new Error('User is already an admin');
    }

    // Add to admins array
    room.admins.push(userID);

    room.updatedOn = new Date();
    await room.save();

    console.log(`🔵 elevateToAdminService - User ${userID} elevated to admin`);
  } catch (error) {
    console.error('❌ Error in elevateToAdminService:', error);
    throw error;
  }
};
