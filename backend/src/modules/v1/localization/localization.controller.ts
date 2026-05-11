import { Request, Response } from 'express';
import { LocalizationService } from './localization.service';

const localizationService = new LocalizationService();

export class LocalizationController {
  async getTranslations(req: Request, res: Response) {
    const lang = Array.isArray(req.params.lang)
      ? req.params.lang[0]
      : req.params.lang;

    const namespace = Array.isArray(req.params.namespace)
      ? req.params.namespace[0]
      : req.params.namespace;

    try {
      const translations = await localizationService.getTranslations(lang, namespace);
      res.json({ version: 1, data: translations });
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'Language or namespace not found' });
    }
  }
}