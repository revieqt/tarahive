import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { createPost } from '@/services/postService';
import { showError, showSuccess } from '@/services/toast.service';
import { CreatePostInput } from '@/types/postTypes';

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (input: CreatePostInput) => {
      if (!input.text?.trim() && !input.images?.length) {
        throw new Error('Write something or add an image before posting.');
      }
      return createPost({ ...input, text: input.text?.trim() || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      showSuccess('Post created');
      router.back();
    },
    onError: (error: Error) => showError('Create post failed', error.message),
  });
  return { create: mutation.mutate, isPending: mutation.isPending };
};
