import { Router } from 'express';
import { getLocaleHandler } from './localization.controller';

const router = Router();

router.get('/:lang', getLocaleHandler);

export default router;
