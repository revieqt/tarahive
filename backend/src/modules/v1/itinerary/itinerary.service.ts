import { AppDataSource } from '../../../config/postgres';
import { Itinerary, ItineraryStatus } from './itinerary.entity';
import {
  CreateItineraryRequest,
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

    const itineraryRepository =
      AppDataSource.getRepository(Itinerary);

    const itinerary = itineraryRepository.create({
      user: userId as any,
      title: itineraryData.title,
      type: itineraryData.type,
      description: itineraryData.description,
      startDate: itineraryData.startDate,
      endDate: itineraryData.endDate,
      planDaily: itineraryData.planDaily,
      locations: itineraryData.locations,
      status: ItineraryStatus.ACTIVE,
      isPrivate: true,
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

    const itineraryRepository =
      AppDataSource.getRepository(Itinerary);

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
    if (itinerary.isPrivate && itinerary.user.id !== userId) {
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
  userId: string
): Promise<Itinerary[]> => {
  try {
    console.log(
      '🟡 getAllUserItinerariesService - Fetching all itineraries for user:',
      userId
    );

    const itineraryRepository =
      AppDataSource.getRepository(Itinerary);

    const itineraries = await itineraryRepository
      .createQueryBuilder('itinerary')
      .select([
        'itinerary.id',
        'itinerary.title',
        'itinerary.type',
        'itinerary.description',
        'itinerary.startDate',
        'itinerary.endDate',
        'itinerary.status',
      ])
      .where('itinerary.user.id = :userId', { userId })
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