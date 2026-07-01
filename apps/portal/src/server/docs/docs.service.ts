import fs from 'fs';
import path from 'path';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface DocSectionRef {
  id: string;
  title: string;
}

export interface DocGroup {
  id: string;
  name: string;
  sections: DocSectionRef[];
}

export interface DocIndex {
  id: string;
  name: string;
  version: string;
  created_on: string;
  groups: DocGroup[];
}

export interface DocBlock {
  type: string;
  [key: string]: unknown;
}

export interface DocSectionContent {
  id: string;
  title: string;
  subtitle?: string;
  blocks: DocBlock[];
}

/* ------------------------------------------------------------------ */
/* Errors                                                             */
/* ------------------------------------------------------------------ */

export class DocsError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'DocsError';
    this.statusCode = statusCode;
  }
}

export class DocsNotFoundError extends DocsError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'DocsNotFoundError';
  }
}

export class DocsBadRequestError extends DocsError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'DocsBadRequestError';
  }
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

// Resolves to <project-root>/server/docs/files — but Next.js projects
// sometimes put source under src/, in which case the real path is
// <project-root>/src/server/docs/files. process.cwd() is always the
// project root either way, so we check both and use whichever exists.
function resolveDocsRoot(): string {
  const withoutSrc = path.join(process.cwd(), 'server', 'docs', 'files');
  const withSrc = path.join(process.cwd(), 'src', 'server', 'docs', 'files');

  if (fs.existsSync(withoutSrc)) return withoutSrc;
  if (fs.existsSync(withSrc)) return withSrc;

  // Neither exists — fail loudly with both paths so this is easy to debug
  // instead of surfacing as a generic 404 with no context.
  throw new DocsError(
    `Docs data folder not found. Checked:\n` +
      `  - ${withoutSrc}\n` +
      `  - ${withSrc}\n` +
      `Make sure your "files" directory (containing e.g. files/manual/v1.0/index.json) ` +
      `is actually present on disk at one of these locations.`,
    500
  );
}

const DOCS_ROOT = resolveDocsRoot();

// matches "v1", "v1.0", "v2.10", case-insensitive
const VERSION_DIR_REGEX = /^v(\d+)(?:\.(\d+))?$/i;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Guards against path traversal / invalid path segments coming from
 * user-controlled route params (fileName, section, version).
 */
function safeSegment(segment: string, label: string): string {
  if (
    !segment ||
    segment.includes('..') ||
    segment.includes('/') ||
    segment.includes('\\') ||
    segment.includes('\0')
  ) {
    throw new DocsBadRequestError(`Invalid ${label}: "${segment}"`);
  }
  return segment;
}

function parseVersion(versionDir: string): [number, number] {
  const match = VERSION_DIR_REGEX.exec(versionDir);
  if (!match) return [-1, -1];
  return [parseInt(match[1], 10), parseInt(match[2] ?? '0', 10)];
}

function compareVersionsDesc(a: string, b: string): number {
  const [aMajor, aMinor] = parseVersion(a);
  const [bMajor, bMinor] = parseVersion(b);
  if (aMajor !== bMajor) return bMajor - aMajor;
  return bMinor - aMinor;
}

/** Allows callers to pass "1.0" or "v1.0" interchangeably. */
function normalizeVersionParam(version: string): string {
  const v = version.trim().toLowerCase();
  return v.startsWith('v') ? v : `v${v}`;
}

function readJsonFile<T>(filePath: string, notFoundMessage: string): T {
  if (!fs.existsSync(filePath)) {
    throw new DocsNotFoundError(notFoundMessage);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new DocsError(`Failed to parse JSON at ${filePath}`, 500);
  }
}

/* ------------------------------------------------------------------ */
/* Core service functions                                             */
/* ------------------------------------------------------------------ */

/**
 * Returns available version directory names for a doc file,
 * sorted descending (highest version first).
 */
function getAvailableVersions(fileName: string): string[] {
  const safeFileName = safeSegment(fileName, 'file name');
  const docDir = path.join(DOCS_ROOT, safeFileName);

  if (!fs.existsSync(docDir) || !fs.statSync(docDir).isDirectory()) {
    throw new DocsNotFoundError(`Doc "${fileName}" not found`);
  }

  const versions = fs
    .readdirSync(docDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && VERSION_DIR_REGEX.test(entry.name))
    .map((entry) => entry.name)
    .sort(compareVersionsDesc);

  if (versions.length === 0) {
    throw new DocsNotFoundError(`No versions found for doc "${fileName}"`);
  }

  return versions;
}

/**
 * Resolves which version directory to use for a request.
 * - If `requestedVersion` is given, it must exist (else 404).
 * - Otherwise, the highest available version is used.
 */
function resolveVersion(fileName: string, requestedVersion?: string): string {
  const versions = getAvailableVersions(fileName);

  if (!requestedVersion) {
    return versions[0];
  }

  const normalized = normalizeVersionParam(requestedVersion);
  safeSegment(normalized, 'version');

  if (!versions.includes(normalized)) {
    throw new DocsNotFoundError(
      `Version "${requestedVersion}" not found for doc "${fileName}"`
    );
  }
  return normalized;
}

/**
 * Loads index.json for a doc file, resolving version (query param `v`)
 * to the highest version when not provided.
 */
function getIndex(fileName: string, requestedVersion?: string): DocIndex {
  const safeFileName = safeSegment(fileName, 'file name');
  const version = resolveVersion(safeFileName, requestedVersion);

  const indexPath = path.join(DOCS_ROOT, safeFileName, version, 'index.json');
  return readJsonFile<DocIndex>(
    indexPath,
    `index.json not found for doc "${fileName}" (version ${version})`
  );
}

/** Finds which group in the index contains the given section id. */
function findGroupForSection(index: DocIndex, sectionId: string): DocGroup {
  const group = index.groups.find((g) =>
    g.sections.some((s) => s.id === sectionId)
  );
  if (!group) {
    throw new DocsNotFoundError(
      `Section "${sectionId}" not found in doc "${index.id}" (version ${index.version})`
    );
  }
  return group;
}

/**
 * Loads a single section's content JSON for a doc file, resolving version
 * the same way getIndex does. The section's parent group is looked up via
 * the index, since the route only receives fileName + section.
 */
function getSection(
  fileName: string,
  sectionId: string,
  requestedVersion?: string
): DocSectionContent {
  const safeFileName = safeSegment(fileName, 'file name');
  const safeSectionId = safeSegment(sectionId, 'section id');
  const version = resolveVersion(safeFileName, requestedVersion);

  const index = readJsonFile<DocIndex>(
    path.join(DOCS_ROOT, safeFileName, version, 'index.json'),
    `index.json not found for doc "${fileName}" (version ${version})`
  );

  const group = findGroupForSection(index, safeSectionId);

  const sectionPath = path.join(
    DOCS_ROOT,
    safeFileName,
    version,
    group.id,
    `${safeSectionId}.json`
  );

  return readJsonFile<DocSectionContent>(
    sectionPath,
    `Section file "${safeSectionId}.json" not found in group "${group.id}"`
  );
}

/* ------------------------------------------------------------------ */
/* Export                                                             */
/* ------------------------------------------------------------------ */

export const docsService = {
  getAvailableVersions,
  resolveVersion,
  getIndex,
  getSection,
};

export default docsService;