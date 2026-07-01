import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import docsService, { type DocIndex, type DocSectionContent } from '@/src/services/docsService';

/**
 * Centralized query keys for the docs feature. Keeping them here (rather
 * than inline in each hook) avoids typos/mismatches when invalidating or
 * prefetching from elsewhere in the app.
 */
export const docsQueryKeys = {
  index: (fileName: string, version?: string) =>
    ['docs', fileName, 'index', version ?? 'latest'] as const,
  section: (fileName: string, section: string, version?: string) =>
    ['docs', fileName, section, version ?? 'latest'] as const,
};

/**
 * Fetches the index (table of contents) for a doc file.
 * UI components read `data`, `isLoading`, `isError` from this — they never
 * touch docsService or the api client directly.
 */
export function useDocIndex(fileName: string, version?: string): UseQueryResult<DocIndex> {
  return useQuery({
    queryKey: docsQueryKeys.index(fileName, version),
    queryFn: () => docsService.getDocIndex(fileName, version),
    enabled: Boolean(fileName),
  });
}

/**
 * Fetches a single section's content.
 */
export function useDocSection(
  fileName: string,
  section: string,
  version?: string
): UseQueryResult<DocSectionContent> {
  return useQuery({
    queryKey: docsQueryKeys.section(fileName, section, version),
    queryFn: () => docsService.getDocSection(fileName, section, version),
    enabled: Boolean(fileName) && Boolean(section),
  });
}