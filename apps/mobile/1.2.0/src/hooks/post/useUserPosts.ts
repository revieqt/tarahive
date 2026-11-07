import { useQuery } from '@tanstack/react-query';
import { getUserPosts, getUserReposts } from '@/services/postService';
import { Post } from '@/types/postTypes';

export const useUserPosts = (userId?: string) => {
  const postsQuery = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => getUserPosts(userId as string),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
  const repostsQuery = useQuery({
    queryKey: ['user-reposts', userId],
    queryFn: () => getUserReposts(userId as string),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
  const posts = [
    ...(postsQuery.data?.items ?? []),
    ...(repostsQuery.data ?? []).map((repost) => repost.post),
  ].sort((a, b) => Date.parse(b.createdOn) - Date.parse(a.createdOn));

  return {
    ...postsQuery,
    posts,
    isLoading: postsQuery.isLoading || repostsQuery.isLoading,
    isError: postsQuery.isError || repostsQuery.isError,
  };
};
