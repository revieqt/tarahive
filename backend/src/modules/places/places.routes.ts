import { Router } from 'express';
import countryRoutes from './country/country.routes';

const placesRouter = Router();

placesRouter.use('/country', countryRoutes);

export default placesRouter;