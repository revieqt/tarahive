import { Router } from 'express';
import {
  getTranslationsHandler,
  getAllTranslationsHandler,
  getPreloadTranslationsHandler,
} from './localization.controller';

const router = Router();

// preload specific namespaces
router.get('/:lang/preload', getPreloadTranslationsHandler);

// single namespace
router.get('/:lang/:namespace', getTranslationsHandler);

// ALL namespaces for a language
router.get('/:lang', getAllTranslationsHandler);

export default router;