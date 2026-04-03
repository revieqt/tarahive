import express from 'express';
import localizationRoutes from './localization/localization.routes';
import weatherRoutes from './weather/weather.routes';

const router = express.Router();

router.use('/locales', localizationRoutes);
router.use('/weather', weatherRoutes);

export default router;
