import { Request, Response } from 'express';
import { getCountryPhoneCodes } from './country.service';

export async function getCountryPhoneCodesController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = await getCountryPhoneCodes();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching country phone codes:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch country phone codes',
    });
  }
}