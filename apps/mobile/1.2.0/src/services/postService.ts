import { api } from '@/api/client';
import { Comment, CreatePostInput, PostPage, ReactionSummary, UserRepost } from '@/types/postTypes';

const API_URL = '/v2/posts';
const pageParams = { page: 1, limit: 20 };

export const createPost = (input: CreatePostInput) =>
  api.post(`${API_URL}/`, input);

export const getUserPosts = async (userId: string): Promise<PostPage> =>
  (await api.get<{ success: boolean; data: PostPage }>(`${API_URL}/user/${encodeURIComponent(userId)}`, {
    params: pageParams,
  })).data;

export const getUserReposts = async (userId: string): Promise<UserRepost[]> =>
  (await api.get<{ success: boolean; data: UserRepost[] }>(`${API_URL}/user/${encodeURIComponent(userId)}/reposts`, {
    params: pageParams,
  })).data ?? [];

export const getPostComments = async (postId: string): Promise<Comment[]> =>
  (await api.get<{ success: boolean; data: Comment[] }>(`${API_URL}/${postId}/comments`, {
    params: pageParams,
  })).data ?? [];

export const getPostReaction = async (postId: string): Promise<ReactionSummary> =>
  (await api.get<{ success: boolean; data: ReactionSummary }>(`${API_URL}/${postId}/likes/summary`)).data;

export const likePost = (postId: string) =>
  api.post(`${API_URL}/${postId}/likes`, { likeType: 'liked' });

export const unlikePost = (postId: string) => api.delete(`${API_URL}/${postId}/likes`);

export const commentOnPost = (postId: string, text: string) =>
  api.post(`${API_URL}/${postId}/comments`, { text });

export const repostPost = (postId: string, caption?: string) =>
  api.post(`${API_URL}/${postId}/repost`, { caption });