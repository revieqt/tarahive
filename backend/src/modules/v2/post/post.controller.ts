import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import { LikeTargetType } from './entities/like.entity';
import {
  addTaggedUsers, createComment, createLike, createPost, createRepost, deleteComment,
  deletePost, getPost, listComments, listPosts, listReposts, listTaggedUsers, reactionSummary,
  listLikes,   listUserReposts, removeLike, removeRepost, removeTaggedUser, updateComment, updatePost, updateTaggedVisibility,
  PostServiceError,
} from './post.service';
import { PostListQuery } from './dto/get-posts.dto';

const userId = (req: AuthRequest): string => {
  if (!req.user?.sub) throw new PostServiceError('Unauthorized.', 401);
  return req.user.sub;
};

const pagination = (req: AuthRequest): PostListQuery => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new PostServiceError('Page must be a positive integer and limit must be between 1 and 100.');
  }
  return { page, limit };
};
const param = (req: AuthRequest, name: string): string => {
  const value = req.params[name];
  if (typeof value !== 'string') throw new PostServiceError(`Invalid ${name}.`);
  return value;
};

const respond = (handler: (req: AuthRequest) => Promise<unknown>) =>
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.status(200).json({ success: true, data: await handler(req) });
    } catch (error) {
      const status = error instanceof PostServiceError ? error.status : 500;
      if (status === 500) console.error('Post request failed:', error);
      res.status(status).json({ success: false, message: error instanceof Error ? error.message : 'Request failed.' });
    }
  };

export const createPostController = respond((req) => createPost(userId(req), req.body ?? {}));
export const getPostController = respond((req) => getPost(param(req, 'postId'), userId(req)));
export const updatePostController = respond((req) => updatePost(userId(req), param(req, 'postId'), req.body ?? {}));
export const deletePostController = respond(async (req) => {
  await deletePost(userId(req), param(req, 'postId'));
  return null;
});
export const feedController = respond((req) => listPosts(userId(req), pagination(req)));
export const exploreController = respond((req) => listPosts(userId(req), pagination(req), { explore: true }));
export const userPostsController = respond((req) => listPosts(userId(req), pagination(req), { userId: param(req, 'userId') }));
export const taggedPostsController = respond((req) => listPosts(userId(req), pagination(req), { taggedUserId: param(req, 'userId') }));
export const itineraryPostsController = respond((req) => listPosts(userId(req), pagination(req), { itineraryId: param(req, 'itineraryId') }));

export const taggedUsersController = respond((req) => listTaggedUsers(param(req, 'postId'), userId(req)));
export const addTaggedUsersController = respond((req) => addTaggedUsers(userId(req), param(req, 'postId'), req.body?.userIds ?? []));
export const removeTaggedUserController = respond(async (req) => {
  await removeTaggedUser(userId(req), param(req, 'postId'), param(req, 'userId'));
  return null;
});
export const taggedVisibilityController = respond(async (req) => {
  await updateTaggedVisibility(userId(req), param(req, 'postId'), param(req, 'userId'), req.body?.hideFromProfile);
  return null;
});

export const createRepostController = respond((req) => createRepost(userId(req), param(req, 'postId'), req.body ?? {}));
export const removeRepostController = respond(async (req) => {
  await removeRepost(userId(req), param(req, 'postId'));
  return null;
});
export const repostsController = respond((req) => listReposts(param(req, 'postId'), userId(req), pagination(req)));
export const userRepostsController = respond((req) =>
  listUserReposts(param(req, 'userId'), userId(req), pagination(req)));

export const createCommentController = respond((req) => createComment(userId(req), param(req, 'postId'), req.body ?? {}));
export const commentsController = respond((req) => listComments(param(req, 'postId'), userId(req), pagination(req)));
export const repliesController = respond((req) => listComments(param(req, 'postId'), userId(req), pagination(req), param(req, 'commentId')));
export const replyController = respond((req) => createComment(userId(req), param(req, 'postId'), {
  ...(req.body ?? {}), parentCommentId: param(req, 'commentId'),
}));
export const updateCommentController = respond((req) => updateComment(userId(req), param(req, 'commentId'), req.body?.text));
export const deleteCommentController = respond(async (req) => {
  await deleteComment(userId(req), param(req, 'commentId'));
  return null;
});

const likeTarget = (target: 'post' | 'comment'): LikeTargetType =>
  target === 'post' ? LikeTargetType.POST : LikeTargetType.COMMENT;
export const likeController = (target: 'post' | 'comment') => respond((req) =>
  createLike(userId(req), likeTarget(target), param(req, `${target}Id`), req.body ?? {}));
export const unlikeController = (target: 'post' | 'comment') => respond(async (req) => {
  await removeLike(userId(req), likeTarget(target), param(req, `${target}Id`));
  return null;
});
export const likeSummaryController = (target: 'post' | 'comment') => respond((req) =>
  reactionSummary(userId(req), likeTarget(target), param(req, `${target}Id`)));
export const likesController = (target: 'post' | 'comment') => respond((req) =>
  listLikes(userId(req), likeTarget(target), param(req, `${target}Id`), pagination(req)));
