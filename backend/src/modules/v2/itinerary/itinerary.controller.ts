import { Request, Response } from 'express';
import {
  createItineraryService,
  updateItineraryService,
  updateItineraryStatusService,
  getItineraryCollaboratorsService,
  createItineraryCollaboratorService,
  updateItineraryCollaboratorService,
  deleteItineraryCollaboratorService,
  getItineraryService,
  getAllUserItinerariesService,
} from './itinerary.service';
import {
  CollaboratorPermissions,
  CreateItineraryCollaboratorRequest,
  CreateItineraryRequest,
  ItineraryPrivacy,
  ItineraryStatus,
  UpdateItineraryCollaboratorRequest,
  UpdateItineraryData,
  UpdateItineraryRequest,
  UpdateItineraryStatusRequest,
} from './itinerary.types';

interface AuthRequest extends Request {
  user?: {
    sub: string;
    tv: number;
    st: string;
  };
}

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/**
 * Create a new itinerary
 * POST /v1/itinerary/create
 */
export const createItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 createItinerary - req.user:', req.user);
    const { title, type, content, startDate, endDate, themeColor } = req.body;

    // Get userID from authenticated token 'sub' payload
    const userID = req.user?.sub;
    if (!userID) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Validate required fields
    if (!title || !type || !startDate || !endDate || !themeColor) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, type, startDate, endDate, themeColor',
      });
    }

    const itineraryData: CreateItineraryRequest = {
      title,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      content,
      themeColor,
    };

    const newItinerary = await createItineraryService(userID, itineraryData);

    res.status(201).json({
      success: true,
      message: 'Itinerary created successfully',
      itineraryID: newItinerary.id,
    });
  } catch (error) {
    console.error('❌ Error creating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateItinerary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'A valid JSON request body is required' });
    }

    const body = req.body as Partial<UpdateItineraryRequest>;
    const allowedFields = new Set([
      'itineraryId', 'title', 'type', 'startDate', 'endDate', 'content',
      'privacy', 'themeColor', 'allowSharing', 'allowCopying',
    ]);
    const unexpectedField = Object.keys(body).find((field) => !allowedFields.has(field));

    if (unexpectedField) {
      return res.status(400).json({ success: false, message: `Unexpected field: ${unexpectedField}` });
    }

    if (typeof body.itineraryId !== 'string' || !body.itineraryId.trim()) {
      return res.status(400).json({ success: false, message: 'itineraryId is required' });
    }

    const updateFields = [...allowedFields].filter((field) => field !== 'itineraryId');
    if (!updateFields.some((field) => Object.prototype.hasOwnProperty.call(body, field))) {
      return res.status(400).json({ success: false, message: 'At least one itinerary field must be provided' });
    }

    for (const field of ['title', 'type', 'themeColor'] as const) {
      const value = body[field];
      if (value !== undefined && (typeof value !== 'string' || !value.trim())) {
        return res.status(400).json({ success: false, message: `${field} must be a non-empty string` });
      }
    }

    const updates: UpdateItineraryData = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.type !== undefined) updates.type = body.type;
    if (body.content !== undefined) updates.content = body.content;
    if (body.privacy !== undefined) {
      if (!Object.values(ItineraryPrivacy).includes(body.privacy)) {
        return res.status(400).json({ success: false, message: 'privacy is invalid' });
      }
      updates.privacy = body.privacy;
    }
    if (body.themeColor !== undefined) updates.themeColor = body.themeColor;

    for (const field of ['startDate', 'endDate'] as const) {
      const value = body[field];
      if (value !== undefined) {
        if (typeof value !== 'string' || !value.trim()) {
          return res.status(400).json({ success: false, message: `${field} must be a valid date` });
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return res.status(400).json({ success: false, message: `${field} must be a valid date` });
        }
        updates[field] = date;
      }
    }

    for (const field of ['allowSharing', 'allowCopying'] as const) {
      const value = body[field];
      if (value !== undefined) {
        if (typeof value !== 'boolean') {
          return res.status(400).json({ success: false, message: `${field} must be a boolean` });
        }
        updates[field] = value;
      }
    }

    const itinerary = await updateItineraryService(userId, body.itineraryId, updates);
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found or not editable' });
    }

    return res.status(200).json({
      success: true,
      message: 'Itinerary updated successfully',
      data: itinerary,
    });
  } catch (error) {
    if (error instanceof RangeError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('❌ Error updating itinerary:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateItineraryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'A valid JSON request body is required' });
    }

    const body = req.body as Partial<UpdateItineraryStatusRequest>;
    const unexpectedField = Object.keys(body).find((field) => !['itineraryId', 'status'].includes(field));
    if (unexpectedField) {
      return res.status(400).json({ success: false, message: `Unexpected field: ${unexpectedField}` });
    }

    if (typeof body.itineraryId !== 'string' || !body.itineraryId.trim()) {
      return res.status(400).json({ success: false, message: 'itineraryId is required' });
    }
    if (!Object.values(ItineraryStatus).includes(body.status as ItineraryStatus)) {
      return res.status(400).json({ success: false, message: 'status is invalid' });
    }

    const update: UpdateItineraryStatusRequest = {
      itineraryId: body.itineraryId,
      status: body.status as ItineraryStatus,
    };
    const itinerary = await updateItineraryStatusService(userId, update);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found or not owned by user' });
    }

    return res.status(200).json({
      success: true,
      message: 'Itinerary status updated successfully',
      data: itinerary,
    });
  } catch (error) {
    console.error('❌ Error updating itinerary status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getItineraryCollaborators = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.sub;
  const itineraryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }
  if (!isUuid(itineraryId)) {
    return res.status(400).json({ success: false, message: 'A valid itinerary ID is required' });
  }

  try {
    const collaborators = await getItineraryCollaboratorsService(itineraryId, userId);
    return res.status(200).json({ success: true, data: collaborators });
  } catch (error) {
    console.error('❌ Error retrieving itinerary collaborators:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve collaborators' });
  }
};

export const createItineraryCollaborator = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.sub;
  if (!currentUserId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, message: 'A valid JSON request body is required' });
  }

  const body = req.body as Partial<CreateItineraryCollaboratorRequest>;
  const allowedFields = ['itineraryId', 'userId', 'permission'];
  const unexpectedField = Object.keys(body).find((field) => !allowedFields.includes(field));
  if (unexpectedField) {
    return res.status(400).json({ success: false, message: `Unexpected field: ${unexpectedField}` });
  }
  if (!isUuid(body.itineraryId)) {
    return res.status(400).json({ success: false, message: 'A valid itineraryId is required' });
  }
  if (!isUuid(body.userId)) {
    return res.status(400).json({ success: false, message: 'A valid userId is required' });
  }
  if (!Object.values(CollaboratorPermissions).includes(body.permission as CollaboratorPermissions)) {
    return res.status(400).json({ success: false, message: 'permission is invalid' });
  }

  try {
    const request: CreateItineraryCollaboratorRequest = {
      itineraryId: body.itineraryId,
      userId: body.userId,
      permission: body.permission as CollaboratorPermissions,
    };
    const collaborator = await createItineraryCollaboratorService(currentUserId, request);
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary or user not found, collaborator exists, or user cannot manage collaborators',
      });
    }
    return res.status(201).json({ success: true, data: collaborator });
  } catch (error) {
    console.error('❌ Error creating itinerary collaborator:', error);
    return res.status(500).json({ success: false, message: 'Failed to create collaborator' });
  }
};

export const updateItineraryCollaborator = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.sub;
  if (!currentUserId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, message: 'A valid JSON request body is required' });
  }

  const body = req.body as Partial<UpdateItineraryCollaboratorRequest>;
  const unexpectedField = Object.keys(body).find((field) => !['collaboratorId', 'permission'].includes(field));
  if (unexpectedField) {
    return res.status(400).json({ success: false, message: `Unexpected field: ${unexpectedField}` });
  }
  if (!isUuid(body.collaboratorId)) {
    return res.status(400).json({ success: false, message: 'A valid collaboratorId is required' });
  }
  if (!Object.values(CollaboratorPermissions).includes(body.permission as CollaboratorPermissions)) {
    return res.status(400).json({ success: false, message: 'permission is invalid' });
  }

  try {
    const collaborator = await updateItineraryCollaboratorService(
      currentUserId,
      body.collaboratorId,
      body.permission as CollaboratorPermissions
    );
    if (!collaborator) {
      return res.status(404).json({ success: false, message: 'Collaborator not found or cannot be changed' });
    }
    return res.status(200).json({ success: true, data: collaborator });
  } catch (error) {
    console.error('❌ Error updating itinerary collaborator:', error);
    return res.status(500).json({ success: false, message: 'Failed to update collaborator' });
  }
};

export const deleteItineraryCollaborator = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.sub;
  if (!currentUserId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }
  if (req.body && (typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ success: false, message: 'A valid JSON request body is required' });
  }

  const body = (req.body ?? {}) as { collaboratorId?: unknown };
  if (Object.keys(body).some((field) => field !== 'collaboratorId')) {
    return res.status(400).json({ success: false, message: 'Unexpected request field' });
  }
  if (Object.keys(req.query).some((field) => field !== 'collaboratorId')) {
    return res.status(400).json({ success: false, message: 'Unexpected query parameter' });
  }

  const queryCollaboratorId = req.query.collaboratorId;
  if (queryCollaboratorId !== undefined && typeof queryCollaboratorId !== 'string') {
    return res.status(400).json({ success: false, message: 'A valid collaboratorId is required' });
  }
  if (
    body.collaboratorId !== undefined &&
    queryCollaboratorId !== undefined &&
    body.collaboratorId !== queryCollaboratorId
  ) {
    return res.status(400).json({ success: false, message: 'Conflicting collaboratorId values' });
  }

  const collaboratorId = queryCollaboratorId ?? body.collaboratorId;
  if (!isUuid(collaboratorId)) {
    return res.status(400).json({ success: false, message: 'A valid collaboratorId is required' });
  }

  try {
    const deleted = await deleteItineraryCollaboratorService(currentUserId, collaboratorId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Collaborator not found or cannot be deleted' });
    }
    return res.status(200).json({ success: true, message: 'Collaborator deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting itinerary collaborator:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete collaborator' });
  }
};

/**
 * Get a specific itinerary by ID
 * GET /v1/itinerary/:id
 */
export const getItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 getItinerary - req.user:', req.user);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Get userID from authenticated token 'sub' payload
    const userID = req.user?.sub;
    if (!userID) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Itinerary ID is required' });
    }

    const itinerary = await getItineraryService(id, userID);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Itinerary retrieved successfully',
      data: itinerary,
    });
  } catch (error) {
    console.error('❌ Error retrieving itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all user itineraries
 * GET /v1/itinerary?status=active|done|cancelled
 */
export const getAllUserItineraries = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 getAllUserItineraries - req.user:', req.user);

    // Get userID from authenticated token 'sub' payload
    const userID = req.user?.sub;
    if (!userID) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get status from query parameter (defaults to 'active' if not provided)
    const status = req.query.status as string | undefined;
    const currentMonth = req.query.currentMonth === 'true' || req.query.currentMonth === '1';
    const day = req.query.day as string | undefined;

    if (day) {
      const parsedDay = new Date(day);
      if (Number.isNaN(parsedDay.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid day format. Please use YYYY-MM-DD',
        });
      }
    }

    const itineraries = await getAllUserItinerariesService(userID, status, {
      currentMonth,
      day,
    });

    res.status(200).json({
      success: true,
      message: 'User itineraries retrieved successfully',
      data: itineraries,
    });
  } catch (error) {
    console.error('❌ Error retrieving user itineraries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};