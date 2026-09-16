import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';

export interface DocBlock {
  type: string;
  [key: string]: unknown;
}

export interface DocSection {
  id: string;
  title: string;
  subtitle?: string;
  blocks: DocBlock[];
}

export interface DocIndexSectionRef {
  id: string;
  title: string;
}

export interface DocIndexGroup {
  name: string;
  sections: DocIndexSectionRef[];
}

export interface DocIndex {
  id: string;
  name: string;
  version: string;
  created_on: string;
  groups: DocIndexGroup[];
}

interface UseDocOptions {
  enabled?: boolean;
  includeIndex?: boolean;
  version?: string;
}

interface DocsResponse {
  success: boolean;
  index?: DocIndex;
  section?: DocSection;
}

export const useDoc = (id?: string, sectionId?: string, options: UseDocOptions = {}) => {
  const { enabled = true, includeIndex = false, version } = options;

  const query = useQuery<DocsResponse>({
    queryKey: ['docs', id, sectionId ?? 'index', version ?? 'latest', includeIndex],
    queryFn: async () => {
      if (!id) {
        throw new Error('Doc id is required');
      }

      if (sectionId) {
        return api.get<DocsResponse>(`/docs/${id}/${sectionId}`, {
          params: {
            ...(version ? { v: version } : {}),
            'include-index': includeIndex || true,
          },
        });
      }

      return api.get<DocsResponse>(`/docs/${id}`, {
        params: {
          ...(version ? { v: version } : {}),
        },
      });
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    index: query.data?.index,
    section: query.data?.section,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
