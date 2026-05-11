import { Router } from 'express';
import { LocalizationController } from './localization.controller';

const router = Router();
const controller = new LocalizationController();

// GET /localization/:lang/:namespace
router.get('/:lang/:namespace', controller.getTranslations.bind(controller));

export default router;