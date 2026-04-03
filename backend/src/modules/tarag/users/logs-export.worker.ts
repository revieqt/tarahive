import { Worker } from 'bullmq';
import redis from '../../config/redis';
import { LogModel } from '../system/logs.model';
import { sendEmail } from '../../utils/sendEmail';
import { LogsExportJobData } from './logs-export.queue';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import path from 'path';

/**
 * Delete CSV file after processing
 */
const deleteCSVFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ CSV file deleted: ${filePath}`);
    }
  } catch (error) {
    console.error(`⚠️ Error deleting CSV file:`, error);
  }
};

/**
 * Convert logs data to CSV format
 */
const generateLogsCSV = async (logs: any[], fileName: string): Promise<string> => {
  try {
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, fileName);

    // Define CSV headers based on log structure
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: '_id', title: 'Log ID' },
        { id: 'userId', title: 'User ID' },
        { id: 'action', title: 'Action' },
        { id: 'module', title: 'Module' },
        { id: 'description', title: 'Description' },
        { id: 'ip', title: 'IP Address' },
        { id: 'platform', title: 'Platform' },
        { id: 'severity', title: 'Severity' },
        { id: 'createdOn', title: 'Created On' },
        { id: 'device_brand', title: 'Device Brand' },
        { id: 'device_model', title: 'Device Model' },
        { id: 'device_os', title: 'Device OS' },
        { id: 'device_type', title: 'Device Type' },
        { id: 'device_appVersion', title: 'App Version' },
      ],
    });

    // Transform logs data for CSV
    const csvData = logs.map((log) => ({
      _id: log._id?.toString() || '',
      userId: log.userId || '',
      action: log.action || '',
      module: log.module || '',
      description: log.description || '',
      ip: log.ip || '',
      platform: log.platform || '',
      severity: log.severity || '',
      createdOn: log.createdOn?.toISOString() || '',
      device_brand: log.device?.brand || '',
      device_model: log.device?.model || '',
      device_os: log.device?.os || '',
      device_type: log.device?.type || '',
      device_appVersion: log.device?.appVersion || '',
    }));

    await csvWriter.writeRecords(csvData);
    console.log(`✅ CSV file generated at ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`❌ Error generating CSV:`, error);
    throw error;
  }
};

// Create Logs Export worker
export const logsExportWorker = new Worker<LogsExportJobData>(
  'logs-export',
  async (job) => {
    if (job.name !== 'export-logs') {
      throw new Error(`Unknown job name: ${job.name}`);
    }

    try {
      const { userId, email, startDate, endDate } = job.data;

      console.log(`🟡 Processing logs export job ${job.id} for user ${userId}`);
      job.updateProgress(10);

      // 1. Query logs from the database matching the user ID and date range
      console.log('🟡 Step 1: Fetching logs from database...');
      const logs = await LogModel.find({
        userId: userId,
        createdOn: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }).lean();

      if (logs.length === 0) {
        console.warn(`⚠️ No logs found for the specified date range`);
      } else {
        console.log(`✅ Found ${logs.length} logs for the date range`);
      }
      job.updateProgress(40);

      // 2. Generate CSV file
      console.log('🟡 Step 2: Generating CSV file...');
      const timestamp = Date.now();
      const csvFileName = `logs-export-${userId}-${timestamp}.csv`;
      const csvFilePath = await generateLogsCSV(logs, csvFileName);
      console.log('✅ CSV file generated');
      job.updateProgress(70);

      // 3. Send email with CSV attachment
      console.log('🟡 Step 3: Sending email with CSV attachment...');
      const startDateStr = new Date(startDate).toLocaleDateString();
      const endDateStr = new Date(endDate).toLocaleDateString();

      const emailContent = `
        <h2 style="color: #1f2937; margin-bottom: 16px;">📊 Your Logs Export</h2>
        <p style="color: #6b7280; margin-bottom: 12px;">
          Your logs export request has been processed successfully.
        </p>

        <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 8px 0;"><strong>Date Range:</strong> ${startDateStr} to ${endDateStr}</p>
          <p style="margin: 8px 0;"><strong>Total Logs:</strong> ${logs.length}</p>
          <p style="margin: 8px 0;"><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p style="color: #6b7280; margin: 16px 0;">
          Your logs have been exported to a CSV file and are attached to this email. You can download and review your activity logs.
        </p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0; color: #166534;"><strong>✅ Export completed successfully</strong></p>
        </div>
      `;

      try {
        console.log(`📧 Step 3a: Checking EMAIL_SKIP_SEND flag...`);
        if (process.env.EMAIL_SKIP_SEND === 'true') {
          console.log(`⏭️ Email sending skipped (EMAIL_SKIP_SEND=true)`);
          console.log(`📧 Would send to: ${email}`);
          console.log(`📧 Subject: Your TaraG Logs Export (${startDateStr} - ${endDateStr})`);
        } else {
          console.log(`📧 Step 3b: Sending email to ${email}...`);
          const emailResult = await sendEmail({
            to: email,
            subject: `Your TaraG Logs Export (${startDateStr} - ${endDateStr})`,
            content: emailContent,
            attachments: [
              {
                filename: csvFileName,
                path: csvFilePath,
              },
            ],
          });
          console.log(`✅ Logs export email sent successfully. Message ID: ${emailResult.messageId}`);
        }

        // Delete CSV file after email is sent
        console.log(`📧 Step 3c: Deleting temporary CSV file...`);
        deleteCSVFile(csvFilePath);
      } catch (emailError) {
        // Delete file even if email fails
        console.error(`❌ Step 3 Error: Failed to send export email:`, emailError);
        deleteCSVFile(csvFilePath);
        console.log(`⚠️ Email will be retried by queue system (attempt ${job.attemptsMade + 1}/3)`);
        throw emailError; // Re-throw to let BullMQ retry
      }

      job.updateProgress(100);

      return {
        success: true,
        message: 'Logs export completed successfully',
        logsCount: logs.length,
        csvFileName,
      };
    } catch (error) {
      console.error(`❌ Error processing logs export job ${job.id}:`, error);
      throw error;
    }
  },
  { connection: redis as any }
);

/**
 * Initialize the logs export worker
 */
export const initializeLogsExportWorker = async () => {
  try {
    console.log('🟡 Initializing Logs Export Worker...');
    // Worker is already instantiated above, just ensure it's running
    console.log('✅ Logs Export Worker initialized');
  } catch (error) {
    console.error('❌ Error initializing Logs Export Worker:', error);
    throw error;
  }
};
