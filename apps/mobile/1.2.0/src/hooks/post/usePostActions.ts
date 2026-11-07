import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { commentOnPost, getPostComments, getPostReaction, likePost, repostPost, unlikePost } from '@/services/postService';
import { showError, showSuccess } from '@/services/toast.service';

export const usePostActions = (postId: string) => {
  const client = useQueryClient();
  const reaction = useQuery({ queryKey: ['post-reaction', postId], queryFn: () => getPostReaction(postId) });
  const comments = useQuery({ queryKey: ['post-comments', postId], queryFn: () => getPostComments(postId) });
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [repostCount, setRepostCount] = useState<number | null>(null);
  const [isReposted, setIsReposted] = useState(false);
  const invalidate = () => {
    client.invalidateQueries({ queryKey: ['post-reaction', postId] });
    client.invalidateQueries({ queryKey: ['post-comments', postId] });
    client.invalidateQueries({ queryKey: ['user-reposts'] });
    client.invalidateQueries({ queryKey: ['user-posts'] });
  };
  const like = useMutation({
    mutationFn: () => {
      const currentlyLiked = isLiked ?? Boolean(reaction.data?.currentReaction);
      return currentlyLiked ? unlikePost(postId) : likePost(postId);
    },
    onMutate: () => {
      const nextLiked = !(isLiked ?? Boolean(reaction.data?.currentReaction));
      setIsLiked(nextLiked);
      setLikeCount((current) => Math.max(0, (current ?? reaction.data?.counts?.liked ?? 0) + (nextLiked ? 1 : -1)));
      client.setQueryData(['post-reaction', postId], (current: typeof reaction.data) => current ? {
        ...current,
        currentReaction: nextLiked ? 'liked' : null,
        counts: {
          ...current.counts,
          liked: Math.max(0, (current.counts.liked ?? 0) + (nextLiked ? 1 : -1)),
        },
      } : current);
    },
    onSuccess: invalidate,
    onError: (error: Error) => {
      setIsLiked(null);
      setLikeCount(null);
      client.invalidateQueries({ queryKey: ['post-reaction', postId] });
      showError('Reaction failed', error.message);
    },
  });
  const comment = useMutation({
    mutationFn: (text: string) => commentOnPost(postId, text),
    onSuccess: () => { invalidate(); showSuccess('Comment added'); },
    onError: (error: Error) => showError('Comment failed', error.message),
  });
  const repost = useMutation({
    mutationFn: () => repostPost(postId),
    onMutate: () => {
      setIsReposted(true);
      setRepostCount((current) => (current ?? reaction.data?.repostCount ?? 0) + 1);
    },
    onSuccess: () => { invalidate(); showSuccess('Post reposted'); },
    onError: (error: Error) => {
      setIsReposted(false);
      setRepostCount(null);
      showError('Repost failed', error.message);
    },
  });
  return {
    reaction,
    comments,
    like,
    comment,
    repost,
    isLiked: isLiked ?? Boolean(reaction.data?.currentReaction),
    likeCount: likeCount ?? reaction.data?.counts?.liked ?? 0,
    repostCount: repostCount ?? reaction.data?.repostCount ?? 0,
    isReposted,
  };
};
