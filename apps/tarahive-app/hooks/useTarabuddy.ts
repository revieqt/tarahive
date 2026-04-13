import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  enableTaraBuddyService,
  disableTaraBuddyService,
  searchTaraBuddiesService,
  likeTaraBuddyService,
  updateGenderPreferenceService,
  updateDistancePreferenceService,
  updateAgePreferenceService,
  updateZodiacPreferenceService,
  getMatchesService,
  unmatchService,
  type TaraBuddySettings,
  type TaraBuddyUser,
  type LikeResponse,
  type Match,
} from '@/services/tarabuddyService';

const taraBuddyKeys = {
  all: ['taraBuddy'] as const,
  search: () => [...taraBuddyKeys.all, 'search'] as const,
  settings: () => [...taraBuddyKeys.all, 'settings'] as const,
  matches: () => [...taraBuddyKeys.all, 'matches'] as const,
};

/**
 * Hook to enable TaraBuddy feature
 */
export function useEnableTaraBuddy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await enableTaraBuddyService(),
    onSuccess: (data) => {
      // Invalidate settings query to refetch
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.settings() });
    },
  });
}

/**
 * Hook to disable TaraBuddy feature
 */
export function useDisableTaraBuddy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await disableTaraBuddyService(),
    onSuccess: (data) => {
      // Invalidate settings query to refetch
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.settings() });
    },
  });
}

/**
 * Hook to search for TaraBuddy matches
 */
export function useSearchTaraBuddies() {
  return useQuery({
    queryKey: taraBuddyKeys.search(),
    queryFn: async () => await searchTaraBuddiesService(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes (formerly cacheTime)
  });
}

/**
 * Hook to like a TaraBuddy user
 */
export function useLikeTaraBuddy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (likedUserId: string) => await likeTaraBuddyService(likedUserId),
    onSuccess: () => {
      // Invalidate search results as the like status may have changed
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.search() });
    },
  });
}

/**
 * Hook to update gender preference
 */
export function useUpdateGenderPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preference: string) =>
      await updateGenderPreferenceService(preference),
    onSuccess: () => {
      // Invalidate settings and search results
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.settings() });
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.search() });
    },
  });
}

/**
 * Hook to update distance preference
 */
export function useUpdateDistancePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preference: number) =>
      await updateDistancePreferenceService(preference),
    onSuccess: () => {
      // Invalidate settings and search results
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.settings() });
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.search() });
    },
  });
}

/**
 * Hook to update age preference
 */
export function useUpdateAgePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preference: [number, number]) => {
      console.log('🔵 useTaraBuddy - useUpdateAgePreference mutationFn called with:', preference);
      const result = await updateAgePreferenceService(preference);
      console.log('🟢 useTaraBuddy - mutationFn returned:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🟡 useTaraBuddy - onSuccess called with:', data);
      // Invalidate settings and search results
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.settings() });
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.search() });
    },
    onError: (error) => {
      console.error('🔴 useTaraBuddy - onError called with:', error);
    },
  });
}

/**
 * Hook to update zodiac preference
 */
export function useUpdateZodiacPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preference: string[]) =>
      await updateZodiacPreferenceService(preference),
    onSuccess: () => {
      // Invalidate settings and search results
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.settings() });
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.search() });
    },
  });
}

/**
 * Hook to get all matches for the current user
 */
export function useGetMatches() {
  return useQuery({
    queryKey: taraBuddyKeys.matches(),
    queryFn: async () => await getMatchesService(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes (formerly cacheTime)
  });
}

/**
 * Hook to unmatch with a TaraBuddy user
 */
export function useUnmatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userID: string) => await unmatchService(userID),
    onSuccess: () => {
      // Invalidate matches and search results
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.matches() });
      queryClient.invalidateQueries({ queryKey: taraBuddyKeys.search() });
    },
  });
}
