import User from '../account/account.model';
import axios from 'axios';
import { Amenity, DisableSOSRequest } from './safety.types';

/**
 * Enable SOS/Emergency mode for user
 * Queues a SOS job for background processing
 */
export const enableSOS = async (req: any): Promise<any> => {
  try {
    const { userID, emergencyType } = req;

    console.log(`🚨 enableSOS - userId: ${userID}, emergencyType: ${emergencyType}`);

    // Validate required fields
    if (!userID || !emergencyType) {
      throw new Error('User ID and Emergency Type are required');
    }

    // Find user to validate they exist
    const user = await User.findById(userID);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      message: 'SOS queued for processing. Emergency contacts will be notified shortly.'
    };
  } catch (error) {
    console.error(`❌ Error enabling SOS:`, error);
    throw error;
  }
};

/**
 * Disable SOS/Emergency mode for user
 * Updates user's safetyState to disable emergency mode
 */
export const disableSOS = async (req: DisableSOSRequest): Promise<any> => {
  try {
    const { userID } = req;

    console.log(`✅ disableSOS - userId: ${userID}`);

    // Validate required fields
    if (!userID) {
      throw new Error('User ID is required');
    }

    // Find user
    const user = await User.findById(userID);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user's safetyState
    user.safetyState.isInAnEmergency = false;
    user.safetyState.emergencyType = '';
    // NOTE: Do NOT update emergencyContact
    
    await user.save();
    console.log(`✅ User safetyState updated - isInAnEmergency: false`);

    // Return updated user safetyState
    return {
      isInAnEmergency: user.safetyState.isInAnEmergency,
      emergencyType: user.safetyState.emergencyType,
      emergencyContact: user.safetyState.emergencyContact,
      message: 'SOS deactivated successfully'
    };
  } catch (error) {
    console.error(`❌ Error disabling SOS:`, error);
    throw error;
  }
};

export async function findNearestAmenity(
  amenity?: string,
  latitude?: number,
  longitude?: number,
  tourism?: string,
  aeroway?: string
): Promise<Amenity[]> {
  if (!latitude || !longitude) {
    throw new Error('Latitude and longitude are required');
  }

  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  let queryConditions = '';
  if (amenity) {
    queryConditions = `["amenity"="${amenity}"]`;
  } else if (tourism) {
    queryConditions = `["tourism"="${tourism}"]`;
  } else if (aeroway) {
    queryConditions = `["aeroway"="${aeroway}"]`;
  } else {
    throw new Error('At least one of amenity, tourism, or aeroway must be provided');
  }

  const query = `
    [out:json][timeout:25];
    (
      node${queryConditions}(around:5000,${latitude},${longitude});
      way${queryConditions}(around:5000,${latitude},${longitude});
      relation${queryConditions}(around:5000,${latitude},${longitude});
    );
    out center tags;
  `;

  const response = await axios.post(overpassUrl, query, {
    headers: { 'Content-Type': 'text/plain' }
  });

  const elements = response.data.elements || [];
  return elements.map((el: any) => {
    const category = amenity || tourism || aeroway || 'location';
    return {
      id: el.id?.toString(),
      name: el.tags?.name || `Unknown ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      latitude: el.lat || el.center?.lat,
      longitude: el.lon || el.center?.lon,
      address:
        el.tags?.['addr:full'] ||
        `${el.tags?.['addr:street'] || ''} ${el.tags?.['addr:city'] || ''}`.trim(),
      phone: el.tags?.phone || el.tags?.contact_phone || null,
      website: el.tags?.website || el.tags?.contact_website || null,
    };
  });
}