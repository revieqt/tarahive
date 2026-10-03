import { In } from 'typeorm';
import { AppDataSource } from '../../../config/postgres';
import { User } from '../user/user.entity';
import { Itinerary } from './itinerary.entity';
import { ItineraryCollaborator } from './itinerary-collaborator.entity';
import {
  CreateItineraryRequest,
  CollaboratorPermissions,
  ItineraryStatus,
  ItineraryPrivacy,
  UpdateItineraryData,
  UpdateItineraryStatusRequest,
  CreateItineraryCollaboratorRequest,
  ItineraryCollaboratorResult,
  UpdateItineraryCollaboratorRequest,
} from './itinerary.types';

export const createItineraryService = async (
  userId: string,
  itineraryData: CreateItineraryRequest
): Promise<Itinerary> => {
  try {
    console.log(
      '🟡 createItineraryService - Creating new itinerary for user:',
      userId,
      'Data:',
      itineraryData
    );

    const savedItinerary = await AppDataSource.transaction(async (manager) => {
      const itinerary = manager.create(Itinerary, {
        user: { id: userId } as any,
        title: itineraryData.title,
        type: itineraryData.type,
        startDate: itineraryData.startDate,
        endDate: itineraryData.endDate,
        content: itineraryData.content,
        privacy: ItineraryPrivacy.PRIVATE,
        themeColor: itineraryData.themeColor,
      });

      const savedItinerary = await manager.save(Itinerary, itinerary);
      const collaborator = manager.create(ItineraryCollaborator, {
        itinerary: savedItinerary,
        user: { id: userId } as any,
        permission: CollaboratorPermissions.OWNER,
      });
      await manager.save(ItineraryCollaborator, collaborator);

      return savedItinerary;
    });

    console.log(
      '✅ Itinerary created successfully:',
      savedItinerary
    );

    return savedItinerary;
  } catch (error) {
    console.error(
      '❌ Error creating itinerary:',
      error
    );
    throw error;
  }
};

export const updateItineraryService = async (
  userId: string,
  itineraryId: string,
  updates: UpdateItineraryData
): Promise<Itinerary | null> => {
  return AppDataSource.transaction(async (manager) => {
    const collaborator = await manager.findOne(ItineraryCollaborator, {
      where: {
        itinerary: { id: itineraryId },
        user: { id: userId },
        permission: In([CollaboratorPermissions.OWNER, CollaboratorPermissions.EDIT]),
      },
    });

    if (!collaborator) {
      return null;
    }

    const itineraryRepository = manager.getRepository(Itinerary);
    const itinerary = await itineraryRepository.findOne({
      where: { id: itineraryId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!itinerary) {
      return null;
    }

    if (updates.title !== undefined) itinerary.title = updates.title;
    if (updates.type !== undefined) itinerary.type = updates.type;
    if (updates.startDate !== undefined) itinerary.startDate = updates.startDate;
    if (updates.endDate !== undefined) itinerary.endDate = updates.endDate;
    if (updates.content !== undefined) itinerary.content = updates.content;
    if (updates.privacy !== undefined) itinerary.privacy = updates.privacy;
    if (updates.themeColor !== undefined) itinerary.themeColor = updates.themeColor;

    if (updates.allowSharing !== undefined || updates.allowCopying !== undefined) {
      itinerary.generalPermissions = {
        allowSharing: updates.allowSharing ?? itinerary.generalPermissions?.allowSharing ?? true,
        allowCopying: updates.allowCopying ?? itinerary.generalPermissions?.allowCopying ?? true,
      };
    }

    if (itinerary.startDate > itinerary.endDate) {
      throw new RangeError('Start date must not be after end date');
    }

    itinerary.updatedOn = new Date();
    itinerary.v += 1;

    return itineraryRepository.save(itinerary);
  });
};

export const updateItineraryStatusService = async (
  userId: string,
  update: UpdateItineraryStatusRequest
): Promise<Itinerary | null> => {
  return AppDataSource.transaction(async (manager) => {
    const itineraryRepository = manager.getRepository(Itinerary);
    const itinerary = await itineraryRepository.findOne({
      where: { id: update.itineraryId, user: { id: userId } },
      lock: { mode: 'pessimistic_write' },
    });

    if (!itinerary) {
      return null;
    }

    itinerary.status = update.status;
    itinerary.updatedOn = new Date();
    itinerary.v += 1;

    return itineraryRepository.save(itinerary);
  });
};

const toCollaboratorResult = (
  collaborator: ItineraryCollaborator
): ItineraryCollaboratorResult => ({
  collaboratorId: collaborator.id,
  userId: collaborator.user.id,
  profileImage: collaborator.user.profileImage ?? '',
  fname: collaborator.user.fname ?? '',
  lname: collaborator.user.lname ?? '',
  username: collaborator.user.username ?? '',
  permissions: collaborator.permission,
});

export const getItineraryCollaboratorsService = async (
  itineraryId: string,
  currentUserId: string
): Promise<ItineraryCollaboratorResult[]> => {
  const collaborators = await AppDataSource.getRepository(ItineraryCollaborator)
    .createQueryBuilder('collaborator')
    .innerJoin('collaborator.itinerary', 'itinerary')
    .innerJoin('collaborator.user', 'user')
    .innerJoin(
      ItineraryCollaborator,
      'requester',
      'requester."itineraryId" = itinerary.id AND requester."userId" = :currentUserId',
      { currentUserId }
    )
    .select([
      'collaborator.id',
      'collaborator.permission',
      'user.id',
      'user.profileImage',
      'user.fname',
      'user.lname',
      'user.username',
    ])
    .where('itinerary.id = :itineraryId', { itineraryId })
    .orderBy('collaborator.createdOn', 'ASC')
    .getMany();

  return collaborators.map(toCollaboratorResult);
};

export const createItineraryCollaboratorService = async (
  currentUserId: string,
  request: CreateItineraryCollaboratorRequest
): Promise<ItineraryCollaboratorResult | null> => {
  return AppDataSource.transaction(async (manager) => {
    const itinerary = await manager.findOne(Itinerary, {
      where: { id: request.itineraryId, user: { id: currentUserId } },
    });
    if (!itinerary) return null;

    const user = await manager.findOne(User, { where: { id: request.userId } });
    if (!user) return null;

    if (request.permission === CollaboratorPermissions.OWNER && user.id !== currentUserId) {
      return null;
    }

    const existingCollaborator = await manager.findOne(ItineraryCollaborator, {
      where: { itinerary: { id: request.itineraryId }, user: { id: request.userId } },
    });
    if (existingCollaborator) return null;

    const collaborator = manager.create(ItineraryCollaborator, {
      itinerary,
      user,
      permission: request.permission,
    });
    return toCollaboratorResult(await manager.save(ItineraryCollaborator, collaborator));
  });
};

export const updateItineraryCollaboratorService = async (
  currentUserId: string,
  collaboratorId: string,
  permission: CollaboratorPermissions
): Promise<ItineraryCollaboratorResult | null> => {
  return AppDataSource.transaction(async (manager) => {
    const collaborator = await manager
      .createQueryBuilder(ItineraryCollaborator, 'collaborator')
      .innerJoinAndSelect('collaborator.user', 'user')
      .innerJoin('collaborator.itinerary', 'itinerary')
      .innerJoin('itinerary.user', 'owner')
      .where('collaborator.id = :collaboratorId', { collaboratorId })
      .andWhere('owner.id = :currentUserId', { currentUserId })
      .setLock('pessimistic_write', undefined, ['collaborator'])
      .getOne();
    if (!collaborator) return null;

    const isOwnerRow = collaborator.user.id === currentUserId;
    if (isOwnerRow && permission !== CollaboratorPermissions.OWNER) return null;
    if (!isOwnerRow && permission === CollaboratorPermissions.OWNER) return null;

    collaborator.permission = permission;
    return toCollaboratorResult(await manager.save(ItineraryCollaborator, collaborator));
  });
};

export const deleteItineraryCollaboratorService = async (
  currentUserId: string,
  collaboratorId: string
): Promise<boolean> => {
  return AppDataSource.transaction(async (manager) => {
    const collaborator = await manager
      .createQueryBuilder(ItineraryCollaborator, 'collaborator')
      .innerJoinAndSelect('collaborator.user', 'user')
      .innerJoin('collaborator.itinerary', 'itinerary')
      .innerJoin('itinerary.user', 'owner')
      .where('collaborator.id = :collaboratorId', { collaboratorId })
      .andWhere('owner.id = :currentUserId', { currentUserId })
      .setLock('pessimistic_write', undefined, ['collaborator'])
      .getOne();
    if (!collaborator || collaborator.user.id === currentUserId) {
      return false;
    }

    await manager.remove(ItineraryCollaborator, collaborator);
    return true;
  });
};

export const getItineraryService = async (
  itineraryId: string,
  userId: string
): Promise<Itinerary | null> => {
  try {
    console.log(
      '🟡 getItineraryService - Fetching itinerary:',
      itineraryId,
      'for user:',
      userId
    );

    const itinerary = await AppDataSource.getRepository(Itinerary)
      .createQueryBuilder('itinerary')
      .leftJoin('itinerary.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.isProUser'])
      .innerJoin(
        ItineraryCollaborator,
        'collaborator',
        'collaborator."itineraryId" = itinerary.id AND collaborator."userId" = :userId',
        { userId }
      )
      .where('itinerary.id = :id', { id: itineraryId })
      .getOne();

    if (!itinerary) {
      console.log('🟡 Itinerary not found:', itineraryId);
      return null;
    }

    console.log(
      '✅ Itinerary retrieved successfully:',
      itinerary
    );

    return itinerary;
  } catch (error) {
    console.error(
      '❌ Error retrieving itinerary:',
      error
    );
    throw error;
  }
};

export const getAllUserItinerariesService = async (
  userId: string,
  status?: string,
  filters?: {
    currentMonth?: boolean;
    day?: string;
  }
): Promise<Itinerary[]> => {
  try {
    const hasDateFilter = Boolean(filters?.currentMonth || filters?.day);
    const defaultStatus = status || ItineraryStatus.ACTIVE;

    console.log(
      '🟡 getAllUserItinerariesService - Fetching itineraries for user:',
      userId,
      'with status:',
      hasDateFilter ? ItineraryStatus.ACTIVE : defaultStatus,
      'filters:',
      filters
    );

    const query = AppDataSource.getRepository(Itinerary)
      .createQueryBuilder('itinerary')
      .select([
        'itinerary.id',
        'itinerary.title',
        'itinerary.type',
        'itinerary.content',
        'itinerary.themeColor',
        'itinerary.startDate',
        'itinerary.endDate',
        'itinerary.status',
      ])
      .leftJoin('itinerary.user', 'user')
      .addSelect('user.id')
      .innerJoin(
        ItineraryCollaborator,
        'collaborator',
        'collaborator."itineraryId" = itinerary.id AND collaborator."userId" = :userId',
        { userId }
      )
      .andWhere('itinerary.status = :status', {
        status: hasDateFilter ? ItineraryStatus.ACTIVE : defaultStatus,
      });

    if (filters?.currentMonth && !filters?.day) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      query
        .andWhere('itinerary.startDate <= :monthEnd', { monthEnd })
        .andWhere('itinerary.endDate >= :monthStart', { monthStart });
    }

    if (filters?.day) {
      const parsedDay = new Date(filters.day);
      const dayStart = new Date(parsedDay.getFullYear(), parsedDay.getMonth(), parsedDay.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(parsedDay.getFullYear(), parsedDay.getMonth(), parsedDay.getDate(), 23, 59, 59, 999);

      query
        .andWhere('itinerary.startDate <= :dayEnd', { dayEnd })
        .andWhere('itinerary.endDate >= :dayStart', { dayStart });
    }

    const itineraries = await query
      .orderBy('itinerary.createdOn', 'DESC')
      .getMany();

    console.log(
      '✅ User itineraries retrieved successfully:',
      itineraries.length,
      'itineraries found'
    );

    return itineraries;
  } catch (error) {
    console.error(
      '❌ Error retrieving user itineraries:',
      error
    );
    throw error;
  }
};