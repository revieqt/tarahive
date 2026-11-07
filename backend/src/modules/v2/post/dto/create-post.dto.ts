import { PostPrivacy } from '../entities/post.entity';

export interface CreatePostInput {
  text?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  itineraryId?: string | null;
  privacy?: PostPrivacy;
  taggedUserIds?: string[];
}
