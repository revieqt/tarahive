import { Router } from 'express';
import { i18nMiddleware } from '../../middleware/i18nMiddleware';
import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';
import localizationRoutes from './localization/localization.routes';
import weatherRoutes from './weather/weather.routes';
import itineraryRoutes from './itinerary/itinerary.routes';
import sosRoutes from './sos/sos.routes';
import aiRoutes from './ai/ai.routes';

const v2Router = Router();

v2Router.use('/localization', localizationRoutes);
v2Router.use(i18nMiddleware);
v2Router.use('/auth', authRoutes);
v2Router.use('/user', userRoutes);
v2Router.use('/weather', weatherRoutes);
v2Router.use('/itinerary', itineraryRoutes);
v2Router.use('/sos', sosRoutes);
v2Router.use('/ai', aiRoutes);

export default v2Router;