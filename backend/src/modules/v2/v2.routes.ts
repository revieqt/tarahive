import { Router } from 'express';
import { i18nMiddleware } from '../../middleware/i18nMiddleware';
import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';

const v1Router = Router();

v1Router.use(i18nMiddleware);
v1Router.use('/auth', authRoutes);
v1Router.use('/user', userRoutes);

export default v1Router;