import { User } from '../user/user.entity';
import { DisableSOSRequest } from './sos.types';
import { AppDataSource } from "../../../config/postgres";
import { queueEmail } from '../../../workers/delivery/email.queue';

const userRepo = AppDataSource.getRepository(User);

/**
 * Enable SOS/Emergency mode for user
 * Queues a SOS job for background processing
 */
export const enableSOS = async (req: any): Promise<any> => {
  try {
    const { userID, emergencyType, message, latitude, longitude } = req;

    console.log(`🚨 enableSOS - userId: ${userID}, emergencyType: ${emergencyType}`);

    if (!userID || !emergencyType) {
      throw new Error('User ID and Emergency Type are required');
    }

    const user = await userRepo.findOne({ where: { id: userID } });
    if (!user) {
      throw new Error('User not found');
    }

    const emergencyContactEmail = user.safetyState?.emergencyContact?.email;
    if (!emergencyContactEmail) {
      console.warn('⚠️ No emergency contact email configured for user');
      return {
        success: true,
        message: 'SOS processed, but no emergency contact email was configured.',
      };
    }

    const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    const emailContent = `
      <div style="background-color: #dc2626; padding: 16px; margin-bottom: 16px; border-radius: 15px; text-align: center; color: #fff">
        <h1>🚨 SOS ALERT</h1>
        <p style="margin: 0; font-weight: bold;">${user.fname} ${user.lname || ''} is in an emergency.</p>
      </div>
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
        <p><strong>Emergency Type:</strong> ${emergencyType}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <p><strong>Location:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
        <p><a href="${mapUrl}">View location on Google Maps</a></p>
      </div>
    `;

    await queueEmail({
      to: emergencyContactEmail,
      subject: `🚨 Emergency Alert: ${emergencyType}`,
      content: emailContent,
    });

    user.safetyState.isInAnEmergency = true;
    user.safetyState.emergencyType = emergencyType;
    
    await userRepo.save(user);

    return {
      success: true,
      message: 'SOS notification queued for emergency contact.',
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

export const updateSafetySettings = async (
  userId: string,
  delivery?: { isEmailEnabled?: boolean; isSMSEnabled?: boolean; alertLang?: string },
  emergencyContact?: { email?: string; phone?: string }
): Promise<Partial<User>> => {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const currentDelivery = user.safetyState?.delivery || {
    isEmailEnabled: false,
    isSMSEnabled: false,
    alertLang: "en",
  };

  const nextDelivery = {
    isEmailEnabled:
      typeof delivery?.isEmailEnabled === "boolean"
        ? delivery.isEmailEnabled
        : currentDelivery.isEmailEnabled,
    isSMSEnabled:
      typeof delivery?.isSMSEnabled === "boolean"
        ? delivery.isSMSEnabled
        : currentDelivery.isSMSEnabled,
    alertLang:
      typeof delivery?.alertLang === "string" && delivery.alertLang.trim()
        ? delivery.alertLang
        : currentDelivery.alertLang || "en",
  };

  const currentEmergencyContact = user.safetyState?.emergencyContact || {};
  const nextEmergencyContact = {
    ...currentEmergencyContact,
    ...(typeof emergencyContact?.email === "string" ? { email: emergencyContact.email } : {}),
    ...(typeof emergencyContact?.phone === "string" ? { phone: emergencyContact.phone } : {}),
  };

  user.safetyState = {
    ...user.safetyState,
    delivery: nextDelivery,
    emergencyContact: nextEmergencyContact,
  };

  await userRepo.save(user);

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};