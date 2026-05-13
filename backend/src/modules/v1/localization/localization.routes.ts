import { Router } from 'express';
import { LocalizationController } from './localization.controller';

const router = Router();
const controller = new LocalizationController();

// single namespace
router.get('/:lang/:namespace', controller.getTranslations.bind(controller));

// ALL namespaces for a language
router.get('/:lang', controller.getAllTranslations.bind(controller));

export default router;