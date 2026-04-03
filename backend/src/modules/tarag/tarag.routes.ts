import express from 'express';
import localizationRoutes from './localization/localization.routes';

const router = express.Router();

router.use('/locales', localizationRoutes);

export default router;
