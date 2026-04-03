import { ItineraryModel, IItinerary } from './itinerary.model';
import { CreateItineraryRequest, UpdateItineraryRequest, ItineraryStatus } from './itinerary.types';

/**
 * View a single itinerary by ID
 */
export const viewItineraryService = async (itineraryID: string): Promise<IItinerary | null> => {
  try {
    console.log('🟡 viewItineraryService - Fetching itinerary:', itineraryID);

    const itinerary = await ItineraryModel.findById(itineraryID);

    if (!itinerary) {
      console.log('❌ Itinerary not found:', itineraryID);
      throw new Error('Itinerary not found');
    }

    console.log('✅ Itinerary fetched successfully:', itinerary);
    return itinerary;
  } catch (error) {
    console.error('❌ Error fetching itinerary:', error);
    throw error;
  }
};

/**
 * Create a new itinerary
 */
export const createItineraryService = async (
  userID: string,
  itineraryData: CreateItineraryRequest
): Promise<IItinerary> => {
  try {
    console.log('🟡 createItineraryService - Creating new itinerary for user:', userID, 'Data:', itineraryData);

    const newItinerary = new ItineraryModel({
      userID,
      title: itineraryData.title,
      type: itineraryData.type,
      description: itineraryData.description,
      startDate: itineraryData.startDate,
      endDate: itineraryData.endDate,
      planDaily: itineraryData.planDaily,
      locations: itineraryData.locations,
      status: 'active',
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const savedItinerary = await newItinerary.save();
    console.log('✅ Itinerary created successfully:', savedItinerary);
    return savedItinerary;
  } catch (error) {
    console.error('❌ Error creating itinerary:', error);
    throw error;
  }
};

/**
 * Update an itinerary
 */
export const updateItineraryService = async (
  itineraryID: string,
  updateData: UpdateItineraryRequest
): Promise<IItinerary> => {
  try {
    console.log('🟡 updateItineraryService - Updating itinerary:', itineraryID, 'Data:', updateData);

    // Always update the updatedOn field
    const dataWithTimestamp = {
      ...updateData,
      updatedOn: new Date(),
    };

    const updatedItinerary = await ItineraryModel.findByIdAndUpdate(
      itineraryID,
      dataWithTimestamp,
      { new: true, runValidators: true }
    );

    if (!updatedItinerary) {
      console.log('❌ Itinerary not found:', itineraryID);
      throw new Error('Itinerary not found');
    }

    console.log('✅ Itinerary updated successfully:', updatedItinerary);
    return updatedItinerary;
  } catch (error) {
    console.error('❌ Error updating itinerary:', error);
    throw error;
  }
};

/**
 * Delete an itinerary
 */
export const deleteItineraryService = async (itineraryID: string): Promise<IItinerary> => {
  try {
    console.log('🟡 deleteItineraryService - Deleting itinerary:', itineraryID);

    const deletedItinerary = await ItineraryModel.findByIdAndDelete(itineraryID);

    if (!deletedItinerary) {
      console.log('❌ Itinerary not found:', itineraryID);
      throw new Error('Itinerary not found');
    }

    console.log('✅ Itinerary deleted successfully:', deletedItinerary);
    return deletedItinerary;
  } catch (error) {
    console.error('❌ Error deleting itinerary:', error);
    throw error;
  }
};

/**
 * Cancel an itinerary (set status to 'cancelled')
 */
export const cancelItineraryService = async (itineraryID: string): Promise<IItinerary> => {
  try {
    console.log('🟡 cancelItineraryService - Cancelling itinerary:', itineraryID);

    const cancelledItinerary = await ItineraryModel.findByIdAndUpdate(
      itineraryID,
      {
        status: 'cancelled' as ItineraryStatus,
        updatedOn: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!cancelledItinerary) {
      console.log('❌ Itinerary not found:', itineraryID);
      throw new Error('Itinerary not found');
    }

    console.log('✅ Itinerary cancelled successfully:', cancelledItinerary);
    return cancelledItinerary;
  } catch (error) {
    console.error('❌ Error cancelling itinerary:', error);
    throw error;
  }
};

/**
 * Mark an itinerary as done (set status to 'done')
 */
export const markItineraryAsDoneService = async (itineraryID: string): Promise<IItinerary> => {
  try {
    console.log('🟡 markItineraryAsDoneService - Marking itinerary as done:', itineraryID);

    const doneItinerary = await ItineraryModel.findByIdAndUpdate(
      itineraryID,
      {
        status: 'done' as ItineraryStatus,
        updatedOn: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!doneItinerary) {
      console.log('❌ Itinerary not found:', itineraryID);
      throw new Error('Itinerary not found');
    }

    console.log('✅ Itinerary marked as done successfully:', doneItinerary);
    return doneItinerary;
  } catch (error) {
    console.error('❌ Error marking itinerary as done:', error);
    throw error;
  }
};

/**
 * Repeat an itinerary (update with new dates and set status to 'active')
 */
export const repeatItineraryService = async (
  itineraryID: string,
  updateData: UpdateItineraryRequest
): Promise<IItinerary> => {
  try {
    console.log('🟡 repeatItineraryService - Repeating itinerary:', itineraryID, 'Data:', updateData);

    // Always set status to 'active' and update the updatedOn field
    const dataWithTimestamp = {
      ...updateData,
      status: 'active' as ItineraryStatus,
      updatedOn: new Date(),
    };

    const repeatedItinerary = await ItineraryModel.findByIdAndUpdate(
      itineraryID,
      dataWithTimestamp,
      { new: true, runValidators: true }
    );

    if (!repeatedItinerary) {
      console.log('❌ Itinerary not found:', itineraryID);
      throw new Error('Itinerary not found');
    }

    console.log('✅ Itinerary repeated successfully:', repeatedItinerary);
    return repeatedItinerary;
  } catch (error) {
    console.error('❌ Error repeating itinerary:', error);
    throw error;
  }
};

/**
 * View all itineraries for a specific user
 */
export const viewUserItinerariesService = async (userID: string): Promise<IItinerary[]> => {
  try {
    console.log('🟡 viewUserItinerariesService - Fetching itineraries for user:', userID);

    const itineraries = await ItineraryModel.find({ userID }).sort({ createdOn: -1 });

    console.log('✅ User itineraries fetched successfully:', itineraries.length, 'itineraries found');
    return itineraries;
  } catch (error) {
    console.error('❌ Error fetching user itineraries:', error);
    throw error;
  }
};

/**
 * Update itinerary privacy (toggle isPrivate)
 */
export const updateItineraryPrivacyService = async (itineraryID: string): Promise<IItinerary> => {
  try {
    console.log('🟡 updateItineraryPrivacyService - Toggling privacy for itinerary:', itineraryID);

    // First fetch the current itinerary to get the current privacy status
    const itinerary = await ItineraryModel.findById(itineraryID);

    if (!itinerary) {
      console.log('❌ Itinerary not found:', itineraryID);
      throw new Error('Itinerary not found');
    }

    // Invert the isPrivate value
    const updatedItinerary = await ItineraryModel.findByIdAndUpdate(
      itineraryID,
      {
        isPrivate: !itinerary.isPrivate,
        updatedOn: new Date(),
      },
      { new: true, runValidators: true }
    );

    console.log('✅ Itinerary privacy updated successfully:', updatedItinerary);
    return updatedItinerary!;
  } catch (error) {
    console.error('❌ Error updating itinerary privacy:', error);
    throw error;
  }
};
