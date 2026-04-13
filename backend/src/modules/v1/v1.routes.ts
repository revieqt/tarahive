import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import localizationRoutes from './localization/localization.routes';
import systemRoutes from './system/system.routes';
import userRoutes from './users/user.routes';
import weatherRoutes from './weather/weather.routes';

const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/localization', localizationRoutes);
v1Router.use('/system', systemRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/weather', weatherRoutes);

export default v1Router;