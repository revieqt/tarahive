import { CreatePostInput } from './create-post.dto';

export type UpdatePostInput = Partial<CreatePostInput> & {
  hideFromProfile?: boolean;
};
