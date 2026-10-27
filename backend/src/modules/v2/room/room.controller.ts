import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import { createRoom, getRoomById } from './room.service';
import { CreateRoomRequest } from './room.types';

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

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