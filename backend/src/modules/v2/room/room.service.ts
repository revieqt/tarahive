import { AppDataSource } from '../../../infrastructure/postgres/postgres';
import { User } from '../user/user.entity';
import { Room } from './room.entity';
import { RoomMember, RoomMemberRole, RoomMemberStatus } from './room-member.entity';
import { CreateRoomRequest } from './room.types';

const roomRepo = AppDataSource.getRepository(Room);

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