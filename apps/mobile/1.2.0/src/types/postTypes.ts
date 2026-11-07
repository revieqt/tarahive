import { UserSearchResult } from './userTypes';

export type PostPrivacy = 'public' | 'only_me' | 'followers' | 'friends_only';

export interface Post {
  id: string;
  userId: string;
  text: string | null;
  images: string[] | null;
  tags: string[] | null;
  itineraryId: string | null;
  privacy: PostPrivacy;
  createdOn: string;
  user?: UserSearchResult;
}

export interface PostPage {
  items: Post[];
  page: number;
  limit: number;
}

export interface UserRepost {
  id: string;
  post: Post;
  caption: string | null;
  createdOn: string;
}

export interface CreatePostInput {
  text?: string;
  images?: string[];
  itineraryId?: string;
  taggedUserIds?: string[];
  privacy?: PostPrivacy;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdOn: string;
  user?: UserSearchResult;
}

export interface ReactionSummary {
  counts: Record<string, number>;
  currentReaction: string | null;
  commentCount: number;
  repostCount: number;
}
