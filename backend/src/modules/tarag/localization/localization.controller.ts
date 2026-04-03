import { Request, Response } from 'express';
import { LocalizationService } from './localization.service';

const localizationService = new LocalizationService();

export class LocalizationController {
  async getTranslations(req: Request, res: Response) {
    const lang = req.params.lang || 'en';

    try {
      const translations = await localizationService.getTranslations(lang as string);
      res.json(translations);
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'Language not found' });
    }
  }
}