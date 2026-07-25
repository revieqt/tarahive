// docs.service.ts

import fs from 'fs';
import path from 'path';
import semver from 'semver';
import { DocIndex, DocSection } from './docs.types';

const CONTENT_ROOT = path.join(__dirname, 'content');
const DEFAULT_LANG = 'en';

/**
 * Thrown for any "doc/version/lang/section not found" case.
 * Catch this in your global error handler and map `statusCode` -> HTTP status.
 */
export class DocsNotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'DocsNotFoundError';
  }
}

// ---------------------------------------------------------------------------
// In-memory caching
// ---------------------------------------------------------------------------
// Every cache entry is keyed by absolute file/dir path and stamped with the
// filesystem mtime at read time. On the next request we do a cheap stat()
// and only re-read + re-parse the file if it actually changed on disk. This
// means content updates (e.g. editing a json file, or `pm2 reload`-less
// deploys that touch the content folder) are picked up automatically without
// needing to restart the process or manually bust the cache.

interface FileCacheEntry<T> {
  data: T;
  mtimeMs: number;
}

const fileCache = new Map<string, FileCacheEntry<unknown>>();

interface VersionsCacheEntry {
  versions: string[];
  mtimeMs: number;
}

const versionsCache = new Map<string, VersionsCacheEntry>();

function readJsonCached<T>(filePath: string): T {
  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    throw new DocsNotFoundError(`File not found: ${filePath}`);
  }

  const cached = fileCache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.data as T;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let data: T;
  try {
    data = JSON.parse(raw) as T;
  } catch (e) {
    throw new Error(`Failed to parse JSON at ${filePath}: ${(e as Error).message}`);
  }

  fileCache.set(filePath, { data, mtimeMs: stat.mtimeMs });
  return data;
}

// ---------------------------------------------------------------------------
// Version resolution (semver)
// ---------------------------------------------------------------------------

function getAvailableVersions(docId: string): string[] {
  const docDir = path.join(CONTENT_ROOT, docId);

  let stat: fs.Stats;
  try {
    stat = fs.statSync(docDir);
  } catch {
    throw new DocsNotFoundError(`Doc "${docId}" not found`);
  }

  const cached = versionsCache.get(docId);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.versions;
  }

  const versions = fs
    .readdirSync(docDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && semver.valid(entry.name))
    .map((entry) => entry.name);

  versionsCache.set(docId, { versions, mtimeMs: stat.mtimeMs });
  return versions;
}

function resolveVersion(docId: string, requestedVersion?: string): string {
  const versions = getAvailableVersions(docId);

  if (versions.length === 0) {
    throw new DocsNotFoundError(`No versions available for doc "${docId}"`);
  }

  if (!requestedVersion) {
    // No "v" param -> latest version via semver.
    return versions.slice().sort(semver.rcompare)[0];
  }

  // Exact match first (fast path for the common case of a full x.y.z string).
  if (versions.includes(requestedVersion)) {
    return requestedVersion;
  }

  // Otherwise treat it as a semver range/partial (e.g. "1.1", "^1.0.0", "~1.1.0")
  // and pick the highest satisfying installed version.
  const best = semver.maxSatisfying(versions, requestedVersion);
  if (!best) {
    throw new DocsNotFoundError(
      `Version "${requestedVersion}" not found for doc "${docId}"`
    );
  }
  return best;
}

// ---------------------------------------------------------------------------
// Language resolution
// ---------------------------------------------------------------------------

function resolveLang(docId: string, version: string, lang: string): string {
  const versionDir = path.join(CONTENT_ROOT, docId, version);

  const requestedLangDir = path.join(versionDir, lang);
  if (fs.existsSync(requestedLangDir)) {
    return lang;
  }

  const fallbackDir = path.join(versionDir, DEFAULT_LANG);
  if (fs.existsSync(fallbackDir)) {
    return DEFAULT_LANG;
  }

  throw new DocsNotFoundError(
    `No content available for doc "${docId}" v${version} in "${lang}" (or fallback "${DEFAULT_LANG}")`
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getIndex(
  docId: string,
  lang: string,
  requestedVersion?: string
): DocIndex {
  const version = resolveVersion(docId, requestedVersion);
  const resolvedLang = resolveLang(docId, version, lang);
  const indexPath = path.join(
    CONTENT_ROOT,
    docId,
    version,
    resolvedLang,
    'index.json'
  );
  return readJsonCached<DocIndex>(indexPath);
}

export function getSection(
  docId: string,
  sectionId: string,
  lang: string,
  requestedVersion?: string
): { index: DocIndex; section: DocSection } {
  const version = resolveVersion(docId, requestedVersion);
  const resolvedLang = resolveLang(docId, version, lang);

  const indexPath = path.join(
    CONTENT_ROOT,
    docId,
    version,
    resolvedLang,
    'index.json'
  );
  const index = readJsonCached<DocIndex>(indexPath);

  const sectionExists = index.groups.some((group) =>
    group.sections.some((s) => s.id === sectionId)
  );
  if (!sectionExists) {
    throw new DocsNotFoundError(
      `Section "${sectionId}" not found in doc "${docId}" v${version}`
    );
  }

  const sectionPath = path.join(
    CONTENT_ROOT,
    docId,
    version,
    resolvedLang,
    `${sectionId}.json`
  );
  const section = readJsonCached<DocSection>(sectionPath);

  return { index, section };
}