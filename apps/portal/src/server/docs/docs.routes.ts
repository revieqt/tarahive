import docsController, {
  HttpRequest,
  HttpResponse,
  NextFunction,
} from './docs.controller';

/* ------------------------------------------------------------------ */
/* Minimal Express-compatible Router shim                             */
/*                                                                     */
/* This mirrors express.Router()'s .get(path, handler) signature so   */
/* this file needs zero packages beyond what's already in the repo.   */
/*                                                                     */
/* When you move to a real Node/Express server, delete this block and */
/* the RouteHandler/Router type below, then replace the top import    */
/* with:                                                               */
/*                                                                     */
/*   import { Router } from 'express';                                */
/*   const router = Router();                                         */
/*                                                                     */
/* ...and the two router.get(...) calls below don't need to change.   */
/* ------------------------------------------------------------------ */

type RouteHandler = (
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction
) => void | Promise<void>;

interface DocsRouter {
  routes: { method: 'GET'; path: string; handler: RouteHandler }[];
  get(path: string, handler: RouteHandler): void;
}

function createRouter(): DocsRouter {
  return {
    routes: [],
    get(path, handler) {
      this.routes.push({ method: 'GET', path, handler });
    },
  };
}

/**
 * Router for the docs feature.
 *
 * GET /docs/:fileName            -> index.json (highest version, or ?v=)
 * GET /docs/:fileName/:section   -> section json (highest version, or ?v=)
 *
 * In a real Node/Express server, mount this with:
 *   app.use('/docs', docsRouter);
 *
 * In Next.js, this file isn't executed directly (Next's app router owns
 * URL matching) — see app/api/docs/[...slug]/route.ts, which calls
 * docsController's functions directly. This file exists so the route
 * table is defined in one place and is ready to hand to Express as-is
 * once you swap the import back in.
 */
const router = createRouter();

router.get('/:fileName', docsController.getDocIndex);
router.get('/:fileName/:section', docsController.getDocSection);

export default router;