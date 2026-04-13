import { Router } from 'express';
import { LocalizationController } from './localization.controller';

const router = Router();
const controller = new LocalizationController();

// GET /api/locales/:lang
router.get('/:lang', controller.getTranslations.bind(controller));

export default router;