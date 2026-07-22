import { User } from '../user/user.entity';
import { DisableSOSRequest } from './sos.types';
import { AppDataSource } from "../../../config/postgres";
import { queueEmail } from '../../../workers/delivery/email.queue';
import { t } from '../localization/localization.service';

const userRepo = AppDataSource.getRepository(User);

export const enableSOS = async (req: any): Promise<any> => {
  try {
    const { userID, emergencyType, message, latitude, longitude } = req;

    if (!userID || !emergencyType) throw new Error('User ID and Emergency Type are required');

    const user = await userRepo.findOne({ where: { id: userID } });
    if (!user) throw new Error('User not found');

    const emergencyContactEmail = user.safetyState?.emergencyContact?.email;
    const delivery = user.safetyState?.delivery || { isEmailEnabled: false, isSMSEnabled: false, alertLang: 'en' };
    const lang = delivery.alertLang || 'en';

    if (!delivery.isEmailEnabled && !delivery.isSMSEnabled) {
      user.safetyState.isInAnEmergency = true;
      user.safetyState.emergencyType = emergencyType;
      await userRepo.save(user);
      return {
        success: true,
        message: 'SOS activated; no delivery channels enabled — database updated.',
      };
    }

    const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

    const header = t('backend.emergency_alert.sos_alert', lang);
    const note = t('backend.emergency_alert.sos_note', lang);
    const detailsTitle = t('backend.emergency_alert.details_title', lang);
    const detailsType = t('backend.emergency_alert.details_type', lang);
    const detailsLoc = t('backend.emergency_alert.details_loc', lang);
    const detailsMaps = t('backend.emergency_alert.details_maps', lang);
    const contactTitle = t('backend.emergency_alert.contact_title', lang);
    const contactEmailLabel = t('backend.emergency_alert.contact_email', lang);
    const contactNumLabel = t('backend.emergency_alert.contact_num', lang);
    const contactNoNum = t('backend.emergency_alert.contact_no_num', lang);
    const emergencyTypeLabel = t(`sos.emergency_types.${emergencyType}`, lang);

    const emailContent = `
      <div style="background-color: #dc2626; padding: 16px; margin-bottom: 16px; border-radius: 15px; text-align: center; color: #fff">
        <h1>🚨 ${header}</h1>
        <p style="margin: 0; font-weight: bold;">${user.fname} ${user.lname || ''} ${note}</p>
      </div>

      <div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
        <h3 style="color: #1f2937; margin-bottom: 8px;">${detailsTitle}</h3>
        <div class="underline"></div>
        <p style="margin: 8px 0;"><strong>${detailsType}:</strong> ${emergencyTypeLabel}</p>
        ${message ? `<p style="margin: 8px 0;"><strong>Message:</strong> ${message}</p>` : ''}
        <p style="margin: 8px 0;"><strong>${detailsLoc}:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
        <a href="${mapUrl}" class="button" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; width: 88%;">${detailsMaps}</a>
      </div>

      <div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
        <h3 style="color: #1f2937; margin-bottom: 8px;">${contactTitle}</h3>
        <div class="underline"></div>
        <p style="margin: 8px 0;"><strong>${contactEmailLabel}:</strong> ${user.email}</p>
        <p style="margin: 8px 0;"><strong>${contactNumLabel}:</strong> ${user.contactNumber || contactNoNum}</p>
      </div>
    `;

    if (delivery.isEmailEnabled) {
      if (!emergencyContactEmail) {
        console.warn('⚠️ No emergency contact email configured for user; skipping email delivery');
      } else {
        await queueEmail({
          to: emergencyContactEmail,
          subject: `🚨 ${header}: ${emergencyTypeLabel}`,
          content: emailContent,
          lang,
        });
      }
    }

    if (delivery.isSMSEnabled) {
      const smsText = `${header}: ${user.fname} ${user.lname || ''} ${note} - ${emergencyTypeLabel} - ${latitude.toFixed(6)},${longitude.toFixed(6)}`;
      console.log('📱 SMS send (simulated):', smsText);
    }

    user.safetyState.isInAnEmergency = true;
    user.safetyState.emergencyType = emergencyType;
    await userRepo.save(user);

    return;
  } catch (error) {
    console.error(`❌ Error enabling SOS:`, error);
    throw error;
  }
};

export const disableSOS = async (req: DisableSOSRequest): Promise<any> => {
  try {
    const { userID } = req;
    if (!userID) throw new Error('User ID is required');

    const user = await userRepo.findOne({ where: { id: userID } });
    if (!user) throw new Error('User not found');

    user.safetyState.isInAnEmergency = false;
    user.safetyState.emergencyType = '';
    
    await userRepo.save(user);

    return;
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

  if (!user) throw new Error("User not found");

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