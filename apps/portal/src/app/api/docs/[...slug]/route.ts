import { NextRequest, NextResponse } from 'next/server';
import docsController, { HttpRequest, HttpResponse } from '@/src/server/docs/docs.controller';

/**
 * Adapter: translates a Next.js app-router request into the minimal
 * Express-shaped req/res that docs.controller.ts expects, then calls
 * the *same* controller functions that would run on a real Node/Express
 * server. Only this file is Next.js-specific — docs.routes.ts,
 * docs.controller.ts, and docs.service.ts have no framework dependency.
 *
 * Matches:
 *   GET /api/docs/[fileName]            -> getDocIndex
 *   GET /api/docs/[fileName]/[section]  -> getDocSection
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
): Promise<NextResponse> {
  const { slug } = await params;
  const [fileName, section] = slug ?? [];

  const httpReq: HttpRequest = {
    params: {
      fileName,
      ...(section ? { section } : {}),
    },
    query: {
      v: req.nextUrl.searchParams.get('v') ?? undefined,
    },
  };

  let statusCode = 200;
  let body: unknown = null;

  const httpRes: HttpResponse = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
    },
  };

  const next = (err?: unknown) => {
    if (err) docsController.handleDocsError(err, httpRes);
  };

  if (section) {
    await docsController.getDocSection(httpReq, httpRes, next);
  } else {
    await docsController.getDocIndex(httpReq, httpRes, next);
  }

  return NextResponse.json(body, { status: statusCode });
}