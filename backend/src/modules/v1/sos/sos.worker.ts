import { Worker } from 'bullmq';
import redis from '../../../config/redis';
import { User } from '../user/user.entity';
import { sendEmail } from '../notification/delivery.service';
import { SOSJobData } from './sos.queue';
import { AppDataSource } from '../../../config/postgres';

const userRepo = AppDataSource.getRepository(User);

// Create SOS worker
export const sosWorker = new Worker<SOSJobData>(
  'sos',
  async (job) => {
    if (job.name !== 'process-sos') {
      throw new Error(`Unknown job name: ${job.name}`);
    }

    try {
      const { userID, emergencyType, message, latitude, longitude } = job.data;

      console.log(`🟡 Processing SOS job ${job.id} for user ${userID}`);
      job.updateProgress(10);

      // 1. Find user and update safetyState
      console.log('🟡 Step 1: Updating user safetyState...');
      const user = await userRepo.findOne({ where: { id: userID } });
      if (!user) {
        throw new Error(`User not found: ${userID}`);
      }

      user.safetyState.isInAnEmergency = true;
      user.safetyState.emergencyType = emergencyType;
      await userRepo.save(user);
      console.log('✅ User safetyState updated');
      job.updateProgress(30);

      // 2. Get emergencyContact from user
      console.log('🟡 Step 2: Getting emergency contact...');
      const emergencyContact = user.safetyState.emergencyContact;
      if (!emergencyContact) {
        console.warn('⚠️ No emergency contact found for user');
        job.updateProgress(100);
        return {
          success: true,
          message: 'SOS processed but no emergency contact to notify',
        };
      }
      job.updateProgress(50);

      // 3. Send email to emergency contact with location coordinates and Google Maps link
      console.log('🟡 Step 3: Sending emergency email...');
      const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

      const emailContent = `
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
          <h2 style="margin-top: 0; color: #dc2626;">🚨 EMERGENCY ALERT</h2>
          <p style="margin: 0; font-weight: bold; color: #7f1d1d;">Someone you know has activated their emergency alert on TaraG.</p>
        </div>

        <h3 style="color: #1f2937; margin-bottom: 8px;">📋 User Information</h3>
        <div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${user.fname} ${user.lname || ''}</p>
          <p style="margin: 8px 0;"><strong>Username:</strong> @${user.username}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 8px 0;"><strong>Contact:</strong> ${user.contactNumber || 'Not provided'}</p>
        </div>

        <h3 style="color: #1f2937; margin-bottom: 8px;">🆘 Emergency Details</h3>
        <div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
          <p style="margin: 8px 0;"><strong>Emergency Type:</strong> ${emergencyType}</p>
          ${message ? `<p style="margin: 8px 0;"><strong>Message:</strong> ${message}</p>` : ''}
        </div>

        <h3 style="color: #1f2937; margin-bottom: 8px;">📍 Location</h3>
        <div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
          <p style="margin: 8px 0;"><strong>Coordinates:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${mapUrl}" class="button" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            📍 View Location on Google Maps
          </a>
        </div>

        <p style="background-color: #fef2f2; padding: 12px; border-radius: 4px; color: #7f1d1d; font-weight: bold; margin: 16px 0;">
          ⚠️ This is an automated emergency alert. Please respond immediately if you can help.
        </p>
      `;

      try {
        console.log(`📧 Step 3a: Checking EMAIL_SKIP_SEND flag...`);
        if (process.env.EMAIL_SKIP_SEND === 'true') {
          console.log(`⏭️ Email sending skipped (EMAIL_SKIP_SEND=true)`);
          console.log(`📧 Would send to: ${emergencyContact}`);
          console.log(`📧 Subject: 🚨 EMERGENCY ALERT: ${emergencyType} - ${user.fname} ${user.lname || ''}`);
        } else {
          console.log(`📧 Step 3b: Sending email to ${emergencyContact}...`);
          const emailResult = await sendEmail({
            to: emergencyContact as string,
            subject: `🚨 EMERGENCY ALERT: ${emergencyType} - ${user.fname} ${user.lname || ''}`,
            content: emailContent,
          });
          console.log(`✅ Emergency email sent successfully. Message ID: ${emailResult.messageId}`);
        }
      } catch (emailError) {
        console.error(`❌ Step 3 Error: Failed to send emergency email:`, emailError);
        console.log(`⚠️ Email will be retried by queue system (attempt ${job.attemptsMade + 1}/3)`);
        throw emailError; // Re-throw to let BullMQ retry
      }

      job.updateProgress(100);

      return {
        success: true,
        message: 'SOS processed successfully',
        userID,
        emergencyContact,
      };
    } catch (error) {
      console.error(`❌ Error processing SOS job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis as any,
    concurrency: 5, // Process up to 5 SOS jobs concurrently
  }
);

sosWorker.on('completed', (job) => {
  console.log(`✅ SOS job ${job.id} completed successfully`);
});

sosWorker.on('failed', (job, err) => {
  console.error(`❌ SOS job ${job?.id} failed:`, err.message);
});

sosWorker.on('error', (err) => {
  console.error(`❌ SOS Worker error:`, err);
});

sosWorker.on('ready', () => {
  console.log('🟢 SOS Worker ready to process jobs');
});

sosWorker.on('active', (job) => {
  console.log(`🟡 SOS Worker started processing job ${job.id}`);
});

sosWorker.on('paused', () => {
  console.log('⏸️ SOS Worker paused');
});

console.log('🟢 SOS Worker initialized and listening for jobs');

// Initialize worker
export const initializeSosWorker = async () => {
  try {
    await sosWorker.waitUntilReady();
    console.log('✅ SOS Worker is ready and connected');
  } catch (error) {
    console.error('❌ Failed to initialize SOS Worker:', error);
  }
};