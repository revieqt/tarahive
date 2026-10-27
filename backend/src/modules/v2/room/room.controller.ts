import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import { createRoom, getRoomById, getRoomMembers, getUserRooms, updateRoom } from './room.service';
import { CreateRoomRequest, UpdateRoomRequest } from './room.types';
import { ImageValidationError } from '../../../infrastructure/storage/validators/image-validator.service';
import { RoomPrivacy } from './room.entity';

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const getUserRoomsController = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'User not authenticated' });
    return;
  }

  try {
    const rooms = await getUserRooms(userId);
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error('Error retrieving user rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve rooms' });
  }
};

export const createRoomController = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'User not authenticated' });
    return;
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ success: false, message: 'A valid JSON request body is required' });
    return;
  }

  const { name, itineraryId } = req.body as Partial<CreateRoomRequest>;
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 255) {
    res.status(400).json({
      success: false,
      message: 'Name is required and must be 255 characters or fewer',
    });
    return;
  }

  if (itineraryId !== undefined && itineraryId !== null && !isUuid(itineraryId)) {
    res.status(400).json({ success: false, message: 'Itinerary ID must be a valid UUID' });
    return;
  }

  try {
    const room = await createRoom(userId, {
      name: name.trim(),
      ...(typeof itineraryId === 'string' ? { itineraryId } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      roomId: room.id,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Failed to create room' });
  }
};

export const getRoomController = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.sub) {
    res.status(401).json({ success: false, message: 'User not authenticated' });
    return;
  }

  const { id } = req.params;
  if (!isUuid(id)) {
    res.status(400).json({ success: false, message: 'Room ID must be a valid UUID' });
    return;
  }

  try {
    const room = await getRoomById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Room retrieved successfully',
      data: {
        ...room,
        itinerary: room.itinerary
          ? {
              id: room.itinerary.id,
              title: room.itinerary.title,
              startDate: room.itinerary.startDate,
              endDate: room.itinerary.endDate,
              type: room.itinerary.type,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error retrieving room:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve room' });
  }
};

export const getRoomMembersController = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'User not authenticated' });
    return;
  }

  const { id } = req.params;
  if (!isUuid(id)) {
    res.status(400).json({ success: false, message: 'Room ID must be a valid UUID' });
    return;
  }

  try {
    const members = await getRoomMembers(id, userId);
    if (!members) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Room members retrieved successfully',
      data: members,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Active room membership required') {
      res.status(403).json({ success: false, message: 'Only room members can view room members' });
      return;
    }
    console.error('Error retrieving room members:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve room members' });
  }
};

export const updateRoomController = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'User not authenticated' });
    return;
  }

  const { id } = req.params;
  if (!isUuid(id)) {
    res.status(400).json({ success: false, message: 'Room ID must be a valid UUID' });
    return;
  }

  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ success: false, message: 'A valid JSON request body is required' });
    return;
  }

  const updates: UpdateRoomRequest = {};
  for (const field of ['name', 'description', 'themeColor'] as const) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    const value = body[field];
    if (field === 'description' && value === null) {
      updates.description = null;
      continue;
    }
    if (typeof value !== 'string') {
      res.status(400).json({ success: false, message: `${field} must be a string` });
      return;
    }
    if (field === 'name') {
      if (!value.trim() || value.trim().length > 255) {
        res.status(400).json({ success: false, message: 'Name must be 1 to 255 characters' });
        return;
      }
      updates.name = value.trim();
    } else if (field === 'description') {
      updates.description = value.trim() || null;
    } else {
      if (!/^#[0-9a-f]{6}$/i.test(value)) {
        res.status(400).json({ success: false, message: 'Theme color must be a valid hex color' });
        return;
      }
      updates.themeColor = value;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'privacy')) {
    if (body.privacy !== RoomPrivacy.PRIVATE && body.privacy !== RoomPrivacy.PUBLIC) {
      res.status(400).json({ success: false, message: 'Privacy must be PRIVATE or PUBLIC' });
      return;
    }
    updates.privacy = body.privacy;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'roomImage')) {
    const encodedImage = body.roomImage;
    const maxBase64Length = Math.ceil((5 * 1024 * 1024) / 3) * 4;
    const isValidBase64 =
      typeof encodedImage === 'string' &&
      encodedImage.length > 0 &&
      encodedImage.length <= maxBase64Length &&
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encodedImage);

    if (!isValidBase64) {
      res.status(400).json({
        success: false,
        message: 'Room image must be valid base64 data no larger than 5 MB',
      });
      return;
    }

    const imageBuffer = Buffer.from(encodedImage, 'base64');
    if (!imageBuffer.length || imageBuffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ success: false, message: 'Room image must be 5 MB or smaller' });
      return;
    }
    updates.roomImage = imageBuffer;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ success: false, message: 'No room fields provided' });
    return;
  }

  try {
    const room = await updateRoom(id, userId, updates);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Room admin membership required') {
      res.status(403).json({ success: false, message: 'Only room admins can update room details' });
      return;
    }
    if (error instanceof ImageValidationError) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: 'Failed to update room' });
  }
};