import docsService, { DocsError } from './docs.service';

/* ------------------------------------------------------------------ */
/* Minimal Express-compatible HTTP types                              */
/*                                                                     */
/* These interfaces intentionally mirror the shapes of Express's      */
/* Request/Response/NextFunction. They're structurally compatible,    */
/* so when you move this file to a real Node/Express backend you can  */
/* delete this block and replace it with:                             */
/*                                                                     */
/*   import { Request, Response, NextFunction } from 'express';       */
/*                                                                     */
/* ...and nothing else in this file needs to change.                  */
/* ------------------------------------------------------------------ */

export interface HttpRequest {
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
}

export interface HttpResponse {
  status(code: number): HttpResponse;
  json(body: unknown): void;
}

export type NextFunction = (err?: unknown) => void;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getVersionParam(req: HttpRequest): string | undefined {
  const v = req.query.v;
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

/* ------------------------------------------------------------------ */
/* Controllers                                                        */
/* ------------------------------------------------------------------ */

/**
 * GET /docs/:fileName
 * Query: ?v= (optional)
 * Returns the index.json for the given doc file / version.
 */
async function getDocIndex(
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction
): Promise<void> {
  try {
    const { fileName } = req.params;
    const version = getVersionParam(req);

    const index = docsService.getIndex(fileName, version);

    res.status(200).json(index);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /docs/:fileName/:section
 * Query: ?v= (optional)
 * Returns the section json for the given doc file / section / version.
 */
async function getDocSection(
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction
): Promise<void> {
  try {
    const { fileName, section } = req.params;
    const version = getVersionParam(req);

    const sectionContent = docsService.getSection(fileName, section, version);

    res.status(200).json(sectionContent);
  } catch (err) {
    next(err);
  }
}

/**
 * Shared error handler. In Express this would be registered as
 * app.use(docsErrorHandler) after the router. Here it's exposed so
 * the Next.js adapter route can reuse the exact same error mapping.
 */
function handleDocsError(err: unknown, res: HttpResponse): void {
  if (err instanceof DocsError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error('[docs] Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

export const docsController = {
  getDocIndex,
  getDocSection,
  handleDocsError,
};

export default docsController;