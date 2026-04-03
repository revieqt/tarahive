import express from 'express';
import authRoutes from './auth/auth.routes';
import systemRoutes from './system/system.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/system', systemRoutes);

export default router;
