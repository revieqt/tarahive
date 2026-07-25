// docs.routes.ts

import { Router } from 'express';
import * as docsController from './docs.controller';

const router = Router();

// NOTE: order matters — the more specific ":id/:sectionId" route must be
// registered before ":id" so "/docs/manual/introduction" doesn't get
// swallowed by a route meant only for "/docs/manual".
router.get('/:id/:sectionId', docsController.getDocSection);
router.get('/:id', docsController.getDocIndex);

export default router;