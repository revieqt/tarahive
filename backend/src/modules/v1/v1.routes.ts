import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import localizationRoutes from './localization/localization.routes';
import userRoutes from './user/user.routes';
// import systemRoutes from './system/system.routes';
import weatherRoutes from './weather/weather.routes';

const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/localization', localizationRoutes);
v1Router.use('/user', userRoutes);
// v1Router.use('/system', systemRoutes);
v1Router.use('/weather', weatherRoutes);

export default v1Router;