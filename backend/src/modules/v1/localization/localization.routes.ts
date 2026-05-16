import { Router } from 'express';
import {
  getTranslationsHandler,
  getAllTranslationsHandler,
} from './localization.controller';

const router = Router();

// single namespace
router.get('/:lang/:namespace', getTranslationsHandler);

// ALL namespaces for a language
router.get('/:lang', getAllTranslationsHandler);

export default router;