import { Request, Response, NextFunction } from 'express';
import { detectLanguage, t as translate } from '../modules/v1/localization/localization.service';

declare global {
  namespace Express {
    interface Locals {
      lang: string;
      t: (key: string) => string;
    }
  }
}

export function i18nMiddleware(req: Request, res: Response, next: NextFunction) {
  const lang = detectLanguage(req.headers['accept-language']);

  res.locals.lang = lang;
  res.locals.t = (key: string) => translate(key, lang);

  next();
}