import { Request, Response } from 'express';
import { getLocale } from './localization.service';

function resolveParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export function getLocaleHandler(req: Request, res: Response): void {
  try {
    res.json(getLocale(resolveParam(req.params.lang)));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Language not found';
    res.status(404).json({ error: message });
  }
}
