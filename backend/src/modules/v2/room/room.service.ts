import { AppDataSource } from '../../../infrastructure/postgres/postgres';
import { randomUUID } from 'node:crypto';
import { User } from '../user/user.entity';
import { Room } from './room.entity';
import { RoomMember, RoomMemberRole, RoomMemberStatus } from './room-member.entity';
import { uploadsStorageService } from '../../../infrastructure/storage';
import { CreateRoomRequest, UpdateRoomRequest } from './room.types';

const roomRepo = AppDataSource.getRepository(Room);
const roomMemberRepo = AppDataSource.getRepository(RoomMember);

export interface UserRoom {
  id: string;
  name: string;
  privacy: Room['privacy'];
  themeColor: string;
  roomImage: string | null;
  description: string | null;
  members: number;
}

export interface RoomMemberDetails {
  id: string;
  userId: string;
  nickname: string;
  role: RoomMemberRole;
  status: RoomMemberStatus;
  user: {
    username: string | null;
    fname: string | null;
    lname: string | null;
    profileImage: string | null;
  };
}

export const createRoom = async (userId: string, request: CreateRoomRequest): Promise<Room> =>
  AppDataSource.transaction(async (manager) => {
    const user = await manager.findOne(User, { where: { id: userId } });
    if (!user) {
      throw new Error('Authenticated user not found');
    }

    const room = manager.create(Room, {
      name: request.name,
      itineraryId: request.itineraryId ?? null,
    });
    const savedRoom = await manager.save(Room, room);

    const member = manager.create(RoomMember, {
      roomId: savedRoom.id,
      userId,
      role: RoomMemberRole.ADMIN,
      status: RoomMemberStatus.ACTIVE,
      nickname: user.username || user.fname || 'User',
    });
    await manager.save(RoomMember, member);

    return savedRoom;
  });

export type RoomAccessResult =
  | { kind: 'NOT_FOUND' }
  | { kind: 'FORBIDDEN' }
  | {
      kind: 'FOUND';
      room: {
        id: string;
        itineraryId: string | null;
        name: string;
        description: string | null;
        privacy: Room['privacy'];
        themeColor: string;
        roomImage: string | null;
        createdOn: Date;
        updatedOn: Date;
        itinerary: {
          id: string;
          title: string;
          startDate: Date;
          endDate: Date;
          type: string;
        } | null;
      };
      member?: {
        id: string;
        role: RoomMemberRole;
        status: RoomMemberStatus;
      };
    };

export const getRoomById = async (
  roomId: string,
  userId?: string,
): Promise<RoomAccessResult> => {
  const [result] = await roomRepo
    .createQueryBuilder('room')
    .leftJoin('room.itinerary', 'itinerary')
    .leftJoin(
      RoomMember,
      'currentMember',
      'currentMember.roomId = room.id AND currentMember.userId = :userId',
      { userId: userId ?? null },
    )
    .select('room.id', 'id')
    .addSelect('room.itineraryId', 'itineraryId')
    .addSelect('room.name', 'name')
    .addSelect('room.description', 'description')
    .addSelect('room.privacy', 'privacy')
    .addSelect('room.themeColor', 'themeColor')
    .addSelect('room.roomImage', 'roomImage')
    .addSelect('room.createdOn', 'createdOn')
    .addSelect('room.updatedOn', 'updatedOn')
    .addSelect('itinerary.id', 'itinerary_id')
    .addSelect('itinerary.title', 'itinerary_title')
    .addSelect('itinerary.startDate', 'itinerary_startDate')
    .addSelect('itinerary.endDate', 'itinerary_endDate')
    .addSelect('itinerary.type', 'itinerary_type')
    .addSelect('currentMember.id', 'member_id')
    .addSelect('currentMember.role', 'member_role')
    .addSelect('currentMember.status', 'member_status')
    .where('room.id = :roomId', { roomId })
    .getRawMany<{
      id: string;
      itineraryId: string | null;
      name: string;
      description: string | null;
      privacy: Room['privacy'];
      themeColor: string;
      roomImage: string | null;
      createdOn: Date;
      updatedOn: Date;
      itinerary_id: string | null;
      itinerary_title: string | null;
      itinerary_startDate: Date | null;
      itinerary_endDate: Date | null;
      itinerary_type: string | null;
      member_id: string | null;
      member_role: RoomMemberRole | null;
      member_status: RoomMemberStatus | null;
    }>();

  if (!result) return { kind: 'NOT_FOUND' };

  const member = result.member_id
    ? {
        id: result.member_id,
        role: result.member_role as RoomMemberRole,
        status: result.member_status as RoomMemberStatus,
      }
    : undefined;

  if (result.privacy === 'PRIVATE' && !member) {
    return { kind: 'FORBIDDEN' };
  }

  return {
    kind: 'FOUND',
    room: {
      id: result.id,
      itineraryId: result.itineraryId,
      name: result.name,
      description: result.description,
      privacy: result.privacy,
      themeColor: result.themeColor,
      roomImage: result.roomImage,
      createdOn: result.createdOn,
      updatedOn: result.updatedOn,
      itinerary: result.itinerary_id
        ? {
            id: result.itinerary_id,
            title: result.itinerary_title as string,
            startDate: result.itinerary_startDate as Date,
            endDate: result.itinerary_endDate as Date,
            type: result.itinerary_type as string,
          }
        : null,
    },
    ...(member ? { member } : {}),
  };
};

export const getRoomMembers = async (
  roomId: string,
  userId: string,
): Promise<RoomMemberDetails[] | null> => {
  const requesterMembership = await roomMemberRepo.findOne({
    where: { roomId, userId },
    select: ['id'],
  });
  if (!requesterMembership) {
    const room = await roomRepo.findOne({ where: { id: roomId }, select: ['id'] });
    if (!room) return null;
    throw new Error('Room membership required');
  }

  const members = await roomMemberRepo
    .createQueryBuilder('membership')
    .innerJoin('membership.user', 'user')
    .select('membership.id', 'id')
    .addSelect('membership.userId', 'userId')
    .addSelect('membership.nickname', 'nickname')
    .addSelect('membership.role', 'role')
    .addSelect('membership.status', 'status')
    .addSelect('user.username', 'username')
    .addSelect('user.fname', 'fname')
    .addSelect('user.lname', 'lname')
    .addSelect('user.profileImage', 'profileImage')
    .where('membership.roomId = :roomId', { roomId })
    .orderBy(
      `CASE WHEN membership.role = :adminRole THEN 0 ELSE 1 END`,
      'ASC',
    )
    .addOrderBy('membership.createdOn', 'ASC')
    .setParameter('adminRole', RoomMemberRole.ADMIN)
    .getRawMany<{
      id: string;
      userId: string;
      nickname: string;
      role: RoomMemberRole;
      status: RoomMemberStatus;
      username: string | null;
      fname: string | null;
      lname: string | null;
      profileImage: string | null;
    }>();

  return members.map(({ username, fname, lname, profileImage, ...membership }) => ({
    ...membership,
    user: { username, fname, lname, profileImage },
  }));
};

export type RoomInviteResult = 'INVITED' | 'FORBIDDEN' | 'USER_NOT_FOUND' | 'ALREADY_MEMBER';

export const inviteRoomMember = async (
  roomId: string,
  adminUserId: string,
  invitedUserId: string,
): Promise<RoomInviteResult> => {
  const [result] = await AppDataSource.query(
    `WITH authorized_admin AS (
       SELECT 1
       FROM room_members
       WHERE "roomId" = $1
         AND "userId" = $2
         AND role = 'ADMIN'
         AND status = 'ACTIVE'
     ),
     target AS (
       SELECT id, COALESCE(NULLIF(username, ''), NULLIF(fname, ''), 'User') AS nickname
       FROM users
       WHERE id = $3
     ),
     inserted AS (
       INSERT INTO room_members
         (id, "roomId", "userId", role, status, nickname, "createdOn", "updatedOn")
       SELECT $4, $1, target.id, 'MEMBER', 'INVITED', target.nickname, NOW(), NOW()
       FROM target
       WHERE EXISTS (SELECT 1 FROM authorized_admin)
       ON CONFLICT ("roomId", "userId") DO NOTHING
       RETURNING id
     )
     SELECT CASE
       WHEN NOT EXISTS (SELECT 1 FROM authorized_admin) THEN 'FORBIDDEN'
       WHEN NOT EXISTS (SELECT 1 FROM target) THEN 'USER_NOT_FOUND'
       WHEN EXISTS (SELECT 1 FROM inserted) THEN 'INVITED'
       ELSE 'ALREADY_MEMBER'
     END AS outcome`,
    [roomId, adminUserId, invitedUserId, randomUUID()],
  );
  return result.outcome as RoomInviteResult;
};

export type RemoveRoomInviteResult = 'REMOVED' | 'FORBIDDEN' | 'NOT_INVITED';

export const removeRoomInvite = async (
  roomId: string,
  adminUserId: string,
  invitedUserId: string,
): Promise<RemoveRoomInviteResult> => {
  const [result] = await AppDataSource.query(
    `WITH authorized_admin AS (
       SELECT 1
       FROM room_members
       WHERE "roomId" = $1
         AND "userId" = $2
         AND role = 'ADMIN'
         AND status = 'ACTIVE'
     ),
     deleted AS (
       DELETE FROM room_members AS invitation
       WHERE invitation."roomId" = $1
         AND invitation."userId" = $3
         AND invitation.status = 'INVITED'
         AND EXISTS (SELECT 1 FROM authorized_admin)
       RETURNING invitation.id
     )
     SELECT CASE
       WHEN NOT EXISTS (SELECT 1 FROM authorized_admin) THEN 'FORBIDDEN'
       WHEN EXISTS (SELECT 1 FROM deleted) THEN 'REMOVED'
       ELSE 'NOT_INVITED'
     END AS outcome`,
    [roomId, adminUserId, invitedUserId],
  );
  return result.outcome as RemoveRoomInviteResult;
};

export type RoomRequestResult = 'REQUESTED' | 'NOT_PUBLIC' | 'ALREADY_MEMBER';

export const requestRoomMembership = async (
  roomId: string,
  userId: string,
): Promise<RoomRequestResult> => {
  const [result] = await AppDataSource.query(
    `WITH public_room AS (
       SELECT id FROM rooms WHERE id = $1 AND privacy = 'PUBLIC'
     ),
     existing AS (
       SELECT id FROM room_members WHERE "roomId" = $1 AND "userId" = $2
     ),
     inserted AS (
       INSERT INTO room_members
         (id, "roomId", "userId", role, status, nickname, "createdOn", "updatedOn")
       SELECT $3, public_room.id, target_user.id, 'MEMBER', 'REQUESTED',
              COALESCE(NULLIF(target_user.username, ''), NULLIF(target_user.fname, ''), 'User'), NOW(), NOW()
       FROM public_room
       JOIN users target_user ON target_user.id = $2
       WHERE NOT EXISTS (SELECT 1 FROM existing)
       RETURNING id
     )
     SELECT CASE
       WHEN NOT EXISTS (SELECT 1 FROM public_room) THEN 'NOT_PUBLIC'
       WHEN EXISTS (SELECT 1 FROM inserted) THEN 'REQUESTED'
       ELSE 'ALREADY_MEMBER'
     END AS outcome`,
    [roomId, userId, randomUUID()],
  );
  return result.outcome as RoomRequestResult;
};

export type CancelRoomRequestResult = 'CANCELLED' | 'NOT_FOUND';

export const cancelRoomMembershipRequest = async (
  roomId: string,
  userId: string,
): Promise<CancelRoomRequestResult> => {
  const [result] = await AppDataSource.query(
    `WITH deleted AS (
       DELETE FROM room_members
       WHERE "roomId" = $1 AND "userId" = $2 AND status = 'REQUESTED'
       RETURNING id
     )
     SELECT CASE WHEN EXISTS (SELECT 1 FROM deleted)
       THEN 'CANCELLED' ELSE 'NOT_FOUND' END AS outcome`,
    [roomId, userId],
  );
  return result.outcome as CancelRoomRequestResult;
};

export type ApproveRoomRequestResult = 'APPROVED' | 'FORBIDDEN' | 'NOT_REQUESTED';

export const approveRoomMembershipRequest = async (
  roomId: string,
  adminUserId: string,
  requestedUserId: string,
): Promise<ApproveRoomRequestResult> => {
  const [result] = await AppDataSource.query(
    `WITH authorized_admin AS (
       SELECT 1 FROM room_members
       WHERE "roomId" = $1 AND "userId" = $2
         AND role = 'ADMIN' AND status = 'ACTIVE'
     ),
     updated AS (
       UPDATE room_members
       SET status = 'ACTIVE', "updatedOn" = NOW()
       WHERE "roomId" = $1 AND "userId" = $3 AND status = 'REQUESTED'
         AND EXISTS (SELECT 1 FROM authorized_admin)
       RETURNING id
     )
     SELECT CASE
       WHEN NOT EXISTS (SELECT 1 FROM authorized_admin) THEN 'FORBIDDEN'
       WHEN EXISTS (SELECT 1 FROM updated) THEN 'APPROVED'
       ELSE 'NOT_REQUESTED'
     END AS outcome`,
    [roomId, adminUserId, requestedUserId],
  );
  return result.outcome as ApproveRoomRequestResult;
};

export type AcceptRoomInviteResult = 'ACCEPTED' | 'NOT_INVITED';

export const acceptRoomInvite = async (
  roomId: string,
  userId: string,
): Promise<AcceptRoomInviteResult> => {
  const [result] = await AppDataSource.query(
    `WITH updated AS (
       UPDATE room_members
       SET status = 'ACTIVE', "updatedOn" = NOW()
       WHERE "roomId" = $1 AND "userId" = $2 AND status = 'INVITED'
       RETURNING id
     )
     SELECT CASE WHEN EXISTS (SELECT 1 FROM updated)
       THEN 'ACCEPTED' ELSE 'NOT_INVITED' END AS outcome`,
    [roomId, userId],
  );
  return result.outcome as AcceptRoomInviteResult;
};

export const updateRoom = async (
  roomId: string,
  userId: string,
  updates: UpdateRoomRequest,
): Promise<Room | null> => {
  const membership = await roomMemberRepo.findOne({
    where: {
      roomId,
      userId,
      role: RoomMemberRole.ADMIN,
      status: RoomMemberStatus.ACTIVE,
    },
  });
  if (!membership) {
    throw new Error('Room admin membership required');
  }

  const room = await roomRepo.findOne({ where: { id: roomId } });
  if (!room) {
    return null;
  }

  if (updates.name !== undefined) room.name = updates.name;
  if (updates.description !== undefined) room.description = updates.description;
  if (updates.privacy !== undefined) room.privacy = updates.privacy;
  if (updates.themeColor !== undefined) room.themeColor = updates.themeColor;

  const oldImageKey = room.roomImage?.startsWith('/uploads/roomImage/')
    ? room.roomImage.slice('/uploads/'.length)
    : undefined;
  const storedImage = updates.roomImage
    ? await uploadsStorageService.uploadImage(updates.roomImage, 'roomImage')
    : undefined;

  if (storedImage) {
    room.roomImage = `/uploads/${storedImage.key}`;
  }

  let savedRoom: Room;
  try {
    savedRoom = await roomRepo.save(room);
  } catch (error) {
    if (storedImage) {
      try {
        await uploadsStorageService.deleteImage(storedImage.key);
      } catch (cleanupError) {
        console.error('Failed to remove room image after room update failed', cleanupError);
      }
    }
    throw error;
  }

  if (storedImage && oldImageKey) {
    await uploadsStorageService.deleteImage(oldImageKey);
  }

  return savedRoom;
};

export const getUserRooms = async (userId: string): Promise<UserRoom[]> => {
  const rooms = await roomMemberRepo
    .createQueryBuilder('membership')
    .innerJoin('membership.room', 'room')
    .leftJoin(
      RoomMember,
      'activeMember',
      'activeMember.roomId = room.id AND activeMember.status = :activeStatus',
      { activeStatus: RoomMemberStatus.ACTIVE }
    )
    .select('room.id', 'id')
    .addSelect('room.name', 'name')
    .addSelect('room.privacy', 'privacy')
    .addSelect('room.themeColor', 'themeColor')
    .addSelect('room.roomImage', 'roomImage')
    .addSelect('room.description', 'description')
    .addSelect('COUNT(DISTINCT activeMember.id)', 'members')
    .where('membership.userId = :userId', { userId })
    .groupBy('room.id')
    .getRawMany<{
      id: string;
      name: string;
      privacy: Room['privacy'];
      themeColor: string;
      roomImage: string | null;
      description: string | null;
      members: string;
    }>();

  return rooms.map((room) => ({ ...room, members: Number(room.members) }));
};