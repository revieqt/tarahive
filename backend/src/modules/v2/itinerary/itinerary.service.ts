import { AppDataSource } from '../../../config/postgres';
import { Itinerary } from './itinerary.entity';
import { ItineraryCollaborator } from './itinerary-collaborator.entity';
import {
  CreateItineraryRequest,
  CollaboratorPermissions,
  CollaboratorStatus,
  ItineraryStatus,
  ItineraryPrivacy,
  UpdateItineraryData,
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
        permission: CollaboratorPermissions.EDIT,
        status: CollaboratorStatus.ACCEPTED,
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
        permission: CollaboratorPermissions.EDIT,
        status: CollaboratorStatus.ACCEPTED,
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
        'collaborator."itineraryId" = itinerary.id AND collaborator."userId" = :userId AND collaborator.status = :collaboratorStatus',
        { userId, collaboratorStatus: CollaboratorStatus.ACCEPTED }
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
      .innerJoin(
        ItineraryCollaborator,
        'collaborator',
        'collaborator."itineraryId" = itinerary.id AND collaborator."userId" = :userId AND collaborator.status = :collaboratorStatus',
        { userId, collaboratorStatus: CollaboratorStatus.ACCEPTED }
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