import { Router } from 'express';
import { i18nMiddleware } from '../../middleware/i18nMiddleware';
import authRoutes from './auth/auth.routes';
import localizationRoutes from './localization/localization.routes';
import userRoutes from './user/user.routes';
import weatherRoutes from './weather/weather.routes';

const v1Router = Router();

// Registered first — i18nMiddleware never touches these
v1Router.use('/localization', localizationRoutes);

// Middleware applies to everything registered after this line
v1Router.use(i18nMiddleware);

v1Router.use('/auth', authRoutes);
v1Router.use('/user', userRoutes);
v1Router.use('/weather', weatherRoutes);

export default v1Router;