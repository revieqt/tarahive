// localization/localization.controller.ts

import { Request, Response } from 'express';
import { getTranslations, getAllTranslations } from './localization.service';

function resolveParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function getTranslationsHandler(req: Request, res: Response) {
  const lang = resolveParam(req.params.lang);
  const namespace = resolveParam(req.params.namespace);

  try {
    const data = await getTranslations(lang, namespace);
    res.json({ version: 1, data });
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Not found' });
  }
}

export async function getAllTranslationsHandler(req: Request, res: Response) {
  const lang = resolveParam(req.params.lang);

  try {
    const data = await getAllTranslations(lang);
    res.json({ version: 1, data });
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Language not found' });
  }
}