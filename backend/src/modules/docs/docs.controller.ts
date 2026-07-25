// docs.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as docsService from './docs.service';

function getQueryString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') return value;
  return undefined;
}

/**
 * Route params are typed as `string | string[]` in some @types/express /
 * path-to-regexp versions (string[] shows up for repeated/wildcard segments).
 * Our routes never define repeated segments, so this just narrows safely —
 * taking the first value if an array ever shows up.
 */
function getParamString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * GET /docs/:id
 * Query: ?v=1.1.0 (optional)
 */
export function getDocIndex(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = getParamString(req.params.id);
    const version = getQueryString(req.query.v);
    const lang = res.locals.lang || 'en';

    const index = docsService.getIndex(id, lang, version);

    res.json({
      success: true,
      index,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /docs/:id/:sectionId
 * Query: ?v=1.1.0 (optional), ?include-index=true (optional, default false)
 */
export function getDocSection(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = getParamString(req.params.id);
    const sectionId = getParamString(req.params.sectionId);
    const version = getQueryString(req.query.v);
    const includeIndex = req.query['include-index'] === 'true';
    const lang = res.locals.lang || 'en';

    const { index, section } = docsService.getSection(id, sectionId, lang, version);

    if (includeIndex) {
      res.json({
        success: true,
        index,
        section,
      });
    } else {
      res.json({
        success: true,
        section,
      });
    }
  } catch (err) {
    next(err);
  }
}