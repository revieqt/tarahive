import apiClient from '@/src/lib/api/client';

/* ------------------------------------------------------------------ */
/* Types — mirror server/docs/docs.service.ts response shapes         */
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
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildDocsPath(segments: string[], version?: string): string {
  const path = ['/api/docs', ...segments.map(encodeURIComponent)].join('/');
  return version ? `${path}?v=${encodeURIComponent(version)}` : path;
}

/* ------------------------------------------------------------------ */
/* Service                                                             */
/* ------------------------------------------------------------------ */

function getDocIndex(fileName: string, version?: string): Promise<DocIndex> {
  return apiClient.get<DocIndex>(buildDocsPath([fileName], version));
}

function getDocSection(
  fileName: string,
  section: string,
  version?: string
): Promise<DocSectionContent> {
  return apiClient.get<DocSectionContent>(buildDocsPath([fileName, section], version));
}

export const docsService = {
  getDocIndex,
  getDocSection,
};

export default docsService;