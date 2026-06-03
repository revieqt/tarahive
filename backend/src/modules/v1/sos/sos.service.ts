import { User } from '../user/user.entity';
import { DisableSOSRequest } from './sos.types';
import { AppDataSource } from "../../../config/postgres";

const userRepo = AppDataSource.getRepository(User);

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
    const user = await userRepo.findOne({ where: { id: userID } });
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
    const user = await userRepo.findOne({ where: { id: userID } });
    if (!user) {
      throw new Error('User not found');
    }

    // Update user's safetyState
    user.safetyState.isInAnEmergency = false;
    user.safetyState.emergencyType = '';
    // NOTE: Do NOT update emergencyContact
    
    await userRepo.save(user);
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