import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { getItineraryService } from '../modules/v2/itinerary/itinerary.service';
import { getUserById } from '../modules/v2/user/user.service';

export interface ItineraryUpdatedEvent {
  itineraryId: string;
  version: number;
  updatedAt: string;
  actorUserId: string;
  actorName: string;
}

export const isValidItineraryRoomPayload = (
  payload: unknown
): payload is { itineraryId: string } => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const itineraryId = (payload as { itineraryId?: unknown }).itineraryId;
  return typeof itineraryId === 'string' && itineraryId.trim().length > 0;
};

let ioServer: Server | null = null;

export const resetSocketServer = (): void => {
  if (ioServer) {
    ioServer.close();
    ioServer = null;
  }
};

export const initializeSocketServer = (httpServer: HttpServer): Server => {
  if (ioServer) {
    return ioServer;
  }

  ioServer = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  ioServer.use((socket: Socket, next) => {
    const authHeader = socket.handshake.headers.authorization;
    const tokenFromAuth = typeof socket.handshake.auth?.token === 'string'
      ? socket.handshake.auth.token
      : undefined;
    const token = tokenFromAuth ?? (typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : undefined);

    if (!token) {
      return next(new Error('Unauthorized: missing token'));
    }

    try {
      const secretKey = process.env.ACCESS_TOKEN_SECRET || 'default_secret';
      const decoded = jwt.verify(token, secretKey) as { sub?: string };

      if (!decoded || typeof decoded.sub !== 'string' || !decoded.sub.trim()) {
        return next(new Error('Unauthorized: invalid token'));
      }

      socket.data.user = decoded;
      return next();
    } catch {
      return next(new Error('Unauthorized: invalid token'));
    }
  });

  ioServer.on('connection', (socket: Socket) => {
    const joinedRooms = new Set<string>();

    const leaveAllRooms = () => {
      for (const roomId of joinedRooms) {
        socket.leave(roomId);
      }
      joinedRooms.clear();
    };

    socket.on('itinerary:join', async (payload: unknown) => {
      if (!isValidItineraryRoomPayload(payload)) {
        socket.emit('itinerary:error', { message: 'A valid itineraryId is required' });
        return;
      }

      const userId = (socket.data.user as { sub?: string } | undefined)?.sub;
      if (!userId) {
        socket.emit('itinerary:error', { message: 'Unauthorized' });
        return;
      }

      if (joinedRooms.has(payload.itineraryId)) {
        socket.emit('itinerary:joined', { itineraryId: payload.itineraryId });
        return;
      }

      const itinerary = await getItineraryService(payload.itineraryId, userId);
      if (!itinerary) {
        socket.emit('itinerary:error', { message: 'Access denied' });
        return;
      }

      await socket.join(payload.itineraryId);
      joinedRooms.add(payload.itineraryId);
      socket.emit('itinerary:joined', { itineraryId: payload.itineraryId });
    });

    socket.on('itinerary:leave', (payload: unknown) => {
      if (!isValidItineraryRoomPayload(payload)) {
        return;
      }

      if (joinedRooms.has(payload.itineraryId)) {
        socket.leave(payload.itineraryId);
        joinedRooms.delete(payload.itineraryId);
      }
    });

    socket.on('disconnect', () => {
      leaveAllRooms();
    });
  });

  return ioServer;
};

export const getSocketIOInstance = (): Server | null => ioServer;

export const notifyItineraryUpdated = async (
  itineraryId: string,
  version: number,
  updatedAt: string,
  actorUserId: string
): Promise<void> => {
  const server = ioServer;
  if (!server) {
    return;
  }

  let actorName = 'A collaborator';
  try {
    const actor = await getUserById(actorUserId);
    const fullName = [actor.fname, actor.lname].filter(Boolean).join(' ').trim();
    actorName = fullName || actor.username || actorName;
  } catch (error) {
    console.warn('Could not load itinerary update actor name:', error);
  }

  server.to(itineraryId).emit('itinerary.updated', {
    itineraryId,
    version,
    updatedAt,
    actorUserId,
    actorName,
  } satisfies ItineraryUpdatedEvent);
};
