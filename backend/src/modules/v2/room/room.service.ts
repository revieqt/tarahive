import { AppDataSource } from '../../../infrastructure/postgres/postgres';
import { User } from '../user/user.entity';
import { Room } from './room.entity';
import { RoomMember, RoomMemberRole, RoomMemberStatus } from './room-member.entity';
import { uploadsStorageService } from '../../../infrastructure/storage';
import { CreateRoomRequest, UpdateRoomRequest } from './room.types';

const roomRepo = AppDataSource.getRepository(Room);
const roomMemberRepo = AppDataSource.getRepository(RoomMember);

export interface UserRoom {
  id: string;
  privacy: Room['privacy'];
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

export const getRoomById = (roomId: string): Promise<Room | null> =>
  roomRepo
    .createQueryBuilder('room')
    .leftJoinAndSelect('room.itinerary', 'itinerary')
    .where('room.id = :roomId', { roomId })
    .getOne();

export const getRoomMembers = async (
  roomId: string,
  userId: string,
): Promise<RoomMemberDetails[] | null> => {
  const requesterMembership = await roomMemberRepo.findOne({
    where: { roomId, userId, status: RoomMemberStatus.ACTIVE },
    select: ['id'],
  });
  if (!requesterMembership) {
    const room = await roomRepo.findOne({ where: { id: roomId }, select: ['id'] });
    if (!room) return null;
    throw new Error('Active room membership required');
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
    .addSelect('room.privacy', 'privacy')
    .addSelect('room.roomImage', 'roomImage')
    .addSelect('room.description', 'description')
    .addSelect('COUNT(DISTINCT activeMember.id)', 'members')
    .where('membership.userId = :userId', { userId })
    .groupBy('room.id')
    .getRawMany<{
      id: string;
      privacy: Room['privacy'];
      roomImage: string | null;
      description: string | null;
      members: string;
    }>();

  return rooms.map((room) => ({ ...room, members: Number(room.members) }));
};