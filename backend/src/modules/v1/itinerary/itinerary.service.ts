import { AppDataSource } from '../../../config/postgres';
import { Itinerary } from './itinerary.entity';
import {
  CreateItineraryRequest,
  PublicPermissions,
  ItineraryStatus,
  ItineraryPrivacy,
} from './itinerary.types';

const itineraryRepository = AppDataSource.getRepository(Itinerary);

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

    const itinerary = itineraryRepository.create({
      user: userId as any,
      title: itineraryData.title,
      type: itineraryData.type,
      startDate: itineraryData.startDate,
      endDate: itineraryData.endDate,
      content: itineraryData.content,
      privacy: itineraryData.privacy
    });

    const savedItinerary =
      await itineraryRepository.save(itinerary);

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

    const itinerary = await itineraryRepository
      .createQueryBuilder('itinerary')
      .leftJoin('itinerary.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.isProUser'])
      .where('itinerary.id = :id', { id: itineraryId })
      .getOne();

    if (!itinerary) {
      console.log('🟡 Itinerary not found:', itineraryId);
      return null;
    }

    // Check authorization: allow if user is owner or itinerary is public
    if (itinerary.privacy === ItineraryPrivacy.ONLY_ME && itinerary.user.id !== userId) {
      console.log(
        '🟡 User not authorized to view this private itinerary'
      );
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
  status?: string
): Promise<Itinerary[]> => {
  try {
    const statusFilter = status || ItineraryStatus.ACTIVE;
    console.log(
      '🟡 getAllUserItinerariesService - Fetching itineraries for user:',
      userId,
      'with status:',
      statusFilter
    );

    const itineraries = await itineraryRepository
      .createQueryBuilder('itinerary')
      .select([
        'itinerary.id',
        'itinerary.title',
        'itinerary.type',
        'itinerary.content',
        'itinerary.startDate',
        'itinerary.endDate',
        'itinerary.status',
      ])
      .where('itinerary.user.id = :userId', { userId })
      .andWhere('itinerary.status = :status', { status: statusFilter })
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

/**
 * Delete an itinerary
 */
export const deleteItineraryService = async (itineraryID: string): Promise<void> => {
  try {
    console.log('🟡 deleteItineraryService - Deleting itinerary:', itineraryID);

    const deletedItinerary = await itineraryRepository.delete(itineraryID);

    if (!deletedItinerary.affected) {
      console.log('❌ Itinerary not found:', itineraryID);
      throw new Error('Itinerary not found');
    }

    console.log('✅ Itinerary deleted successfully:', itineraryID);
  } catch (error) {
    console.error('❌ Error deleting itinerary:', error);
    throw error;
  }
};
