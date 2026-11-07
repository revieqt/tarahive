import { AppDataSource } from '../../../infrastructure/database/client/postgres';
import { IsNull } from 'typeorm';
import { storageService } from '../../../infrastructure/storage';
import { User } from '../user/user.entity';
import { Itinerary } from '../itinerary/itinerary.entity';
import { Comment, CommentType } from './entities/comment.entity';
import { Like, LikeTargetType, LikeType } from './entities/like.entity';
import { Post, PostPrivacy } from './entities/post.entity';
import { PostTagged } from './entities/post-tagged.entity';
import { PostRepost } from './entities/repost.entity';
import { CreatePostInput } from './dto/create-post.dto';
import { UpdatePostInput } from './dto/update-post.dto';
import { PostListQuery } from './dto/get-posts.dto';
import { CreateCommentInput } from './dto/create-comment.dto';
import { CreateRepostInput } from './dto/create-repost.dto';
import { CreateLikeInput } from './dto/create-like.dto';

export class PostServiceError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = 'PostServiceError';
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const assertUuid = (value: string, name: string): void => {
  if (!uuidPattern.test(value)) throw new PostServiceError(`Invalid ${name}.`);
};

const normalizeContent = (input: CreatePostInput | UpdatePostInput): void => {
  if (input.text !== undefined && input.text !== null) {
    input.text = input.text.trim();
    if (input.text.length > 10_000) throw new PostServiceError('Text must be 10,000 characters or fewer.');
  }
  if (input.images !== undefined && input.images !== null &&
      (!Array.isArray(input.images) || input.images.length > 10)) {
    throw new PostServiceError('A post may contain up to 10 images.');
  }
};

const hasContent = (post: { text?: string | null; images?: string[] | null }): boolean =>
  Boolean(post.text?.trim() || post.images?.length);

const storeImages = async (images: string[] | null | undefined): Promise<string[] | null | undefined> => {
  if (images === undefined || images === null) return images;
  const stored: string[] = [];
  const uploadedKeys: string[] = [];
  try {
    for (const image of images) {
      if (image.startsWith('/storage/')) {
        stored.push(image);
        continue;
      }
      const encoded = image.startsWith('data:') ? image.slice(image.indexOf(',') + 1) : image;
      if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
        throw new PostServiceError('Images must be storage paths or valid base64 data.');
      }
      const result = await storageService.uploadImage(Buffer.from(encoded, 'base64'), 'postImage');
      stored.push(`/storage/${result.key}`);
      uploadedKeys.push(result.key);
    }
    return stored;
  } catch (error) {
    await Promise.all(uploadedKeys.map((key) => storageService.deleteImage(key)));
    throw error;
  }
};

const pageOptions = ({ page, limit }: PostListQuery) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const canViewPost = (post: Post, viewerId: string | undefined): boolean =>
  post.userId === viewerId || post.privacy === PostPrivacy.PUBLIC;

const getPostOrThrow = async (postId: string): Promise<Post> => {
  assertUuid(postId, 'post id');
  const post = await AppDataSource.getRepository(Post).findOne({ where: { id: postId } });
  if (!post) throw new PostServiceError('Post not found.', 404);
  return post;
};

const assertCanView = async (postId: string, viewerId?: string): Promise<Post> => {
  const post = await getPostOrThrow(postId);
  if (!canViewPost(post, viewerId)) throw new PostServiceError('Post not found.', 404);
  return post;
};

const validateUsers = async (userIds: string[]): Promise<void> => {
  userIds.forEach((id) => assertUuid(id, 'tagged user id'));
  if (!userIds.length) return;
  const users = await AppDataSource.getRepository(User).findByIds(userIds);
  if (users.length !== new Set(userIds).size) throw new PostServiceError('One or more tagged users were not found.');
};

export const createPost = async (userId: string, input: CreatePostInput): Promise<Post> => {
  normalizeContent(input);
  if (!hasContent(input)) throw new PostServiceError('A post must contain text or at least one image.');
  const images = await storeImages(input.images);
  if (input.itineraryId) assertUuid(input.itineraryId, 'itinerary id');
  const taggedUserIds = [...new Set(input.taggedUserIds ?? [])];
  await validateUsers(taggedUserIds);
  if (input.itineraryId) {
    const itinerary = await AppDataSource.getRepository(Itinerary).findOne({ where: { id: input.itineraryId } });
    if (!itinerary) throw new PostServiceError('Itinerary not found.', 404);
  }
  return AppDataSource.transaction(async (manager) => {
    const post = manager.create(Post, {
      userId, text: input.text?.trim() || null, images: images ?? null,
      tags: input.tags ?? null, itineraryId: input.itineraryId ?? null,
      privacy: input.privacy ?? PostPrivacy.PUBLIC, hideFromProfile: false,
    });
    const saved = await manager.save(Post, post);
    if (taggedUserIds.length) await manager.insert(PostTagged, taggedUserIds.map((taggedUserId) => ({
      postId: saved.id, userId: taggedUserId, hideFromProfile: false,
    })));
    return saved;
  });
};

export const updatePost = async (userId: string, postId: string, input: UpdatePostInput): Promise<Post> => {
  const post = await getPostOrThrow(postId);
  if (post.userId !== userId) throw new PostServiceError('Only the post creator can modify it.', 403);
  normalizeContent(input);
  if (input.itineraryId) assertUuid(input.itineraryId, 'itinerary id');
  if (input.taggedUserIds) await validateUsers([...new Set(input.taggedUserIds)]);
  const previousImages = post.images ?? [];
  const images = await storeImages(input.images);
  Object.assign(post, {
    ...(input.text !== undefined ? { text: input.text?.trim() || null } : {}),
    ...(input.images !== undefined ? { images } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.itineraryId !== undefined ? { itineraryId: input.itineraryId } : {}),
    ...(input.privacy !== undefined ? { privacy: input.privacy } : {}),
    ...(input.hideFromProfile !== undefined ? { hideFromProfile: input.hideFromProfile } : {}),
  });
  if (!hasContent(post)) throw new PostServiceError('A post must contain text or at least one image.');
  const saved = await AppDataSource.transaction(async (manager) => {
    const saved = await manager.save(Post, post);
    if (input.taggedUserIds) {
      await manager.delete(PostTagged, { postId });
      await manager.insert(PostTagged, [...new Set(input.taggedUserIds)].map((userId) => ({
        postId, userId, hideFromProfile: false,
      })));
    }
    return saved;
  });
  if (input.images) {
    const retained = new Set(saved.images ?? []);
    await Promise.all(previousImages
      .filter((image) => image.startsWith('/storage/') && !retained.has(image))
      .map((image) => storageService.deleteImage(image.slice('/storage/'.length))));
  }
  return saved;
};

export const deletePost = async (userId: string, postId: string): Promise<void> => {
  const post = await getPostOrThrow(postId);
  if (post.userId !== userId) throw new PostServiceError('Only the post creator can delete it.', 403);
  if (post.images) await Promise.all(post.images.map((image) =>
    storageService.deleteImage(image.replace(/^\/storage\//, ''))));
  await AppDataSource.getRepository(Post).delete(postId);
};

export const getPost = (postId: string, viewerId?: string): Promise<Post> => assertCanView(postId, viewerId);

export const listPosts = async (
  viewerId: string,
  query: PostListQuery,
  where: { userId?: string; taggedUserId?: string; itineraryId?: string; explore?: boolean } = {},
): Promise<{ items: Post[]; page: number; limit: number }> => {
  const builder = AppDataSource.getRepository(Post).createQueryBuilder('post')
    .orderBy('post.createdOn', 'DESC').skip(pageOptions(query).skip).take(pageOptions(query).take);
  if (where.userId) builder.andWhere('post.userId = :userId', { userId: where.userId }).andWhere('post.hideFromProfile = false');
  if (where.itineraryId) builder.andWhere('post.itineraryId = :itineraryId', { itineraryId: where.itineraryId });
  if (where.explore) builder.andWhere('post.privacy = :privacy', { privacy: PostPrivacy.PUBLIC });
  if (where.taggedUserId) builder.innerJoin(PostTagged, 'tagged',
    'tagged.postId = post.id AND tagged.userId = :taggedUserId AND tagged.hideFromProfile = false',
    { taggedUserId: where.taggedUserId });
  if (where.userId === viewerId || where.taggedUserId === viewerId) {
    builder.andWhere('(post.privacy = :publicPrivacy OR post.userId = :viewerId)', {
      publicPrivacy: PostPrivacy.PUBLIC, viewerId,
    });
  } else builder.andWhere('post.privacy = :publicPrivacy', { publicPrivacy: PostPrivacy.PUBLIC });
  return { items: await builder.getMany(), page: query.page, limit: query.limit };
};

export const listTaggedUsers = async (postId: string, viewerId: string) => {
  await assertCanView(postId, viewerId);
  return AppDataSource.getRepository(PostTagged).find({ where: { postId }, relations: { user: true } });
};

export const addTaggedUsers = async (userId: string, postId: string, userIds: string[]) => {
  const post = await getPostOrThrow(postId);
  if (post.userId !== userId) throw new PostServiceError('Only the post creator can manage tags.', 403);
  const uniqueIds = [...new Set(userIds)];
  await validateUsers(uniqueIds);
  try {
    await AppDataSource.getRepository(PostTagged).insert(uniqueIds.map((taggedUserId) => ({
      postId, userId: taggedUserId, hideFromProfile: false,
    })));
  } catch {
    throw new PostServiceError('One or more users are already tagged.');
  }
  return listTaggedUsers(postId, userId);
};

export const removeTaggedUser = async (userId: string, postId: string, taggedUserId: string) => {
  const post = await getPostOrThrow(postId);
  if (post.userId !== userId) throw new PostServiceError('Only the post creator can manage tags.', 403);
  await AppDataSource.getRepository(PostTagged).delete({ postId, userId: taggedUserId });
};

export const updateTaggedVisibility = async (userId: string, postId: string, taggedUserId: string, hideFromProfile: boolean) => {
  await assertCanView(postId, userId);
  if (userId !== taggedUserId) throw new PostServiceError('Only the tagged user can change this setting.', 403);
  const result = await AppDataSource.getRepository(PostTagged)
    .update({ postId, userId: taggedUserId }, { hideFromProfile });
  if (!result.affected) throw new PostServiceError('Tagged user record not found.', 404);
};

export const createRepost = async (userId: string, postId: string, input: CreateRepostInput) => {
  const post = await assertCanView(postId, userId);
  const existing = await AppDataSource.getRepository(PostRepost).findOne({ where: { userId, postId } });
  if (existing) throw new PostServiceError('You have already reposted this post.');
  try {
    return await AppDataSource.getRepository(PostRepost).save({
      userId, postId, caption: input.caption?.trim() || null,
    });
  } catch {
    throw new PostServiceError('You have already reposted this post.');
  }
};

export const removeRepost = async (userId: string, postId: string) => {
  await assertCanView(postId, userId);
  await AppDataSource.getRepository(PostRepost).delete({ userId, postId });
};

export const listReposts = async (postId: string, viewerId: string, query: PostListQuery) => {
  await assertCanView(postId, viewerId);
  return AppDataSource.getRepository(PostRepost).find({
    where: { postId }, relations: { user: true }, order: { createdOn: 'DESC' }, ...pageOptions(query),
  });
};

export const listUserReposts = async (reposterId: string, viewerId: string, query: PostListQuery) =>
  AppDataSource.getRepository(PostRepost).createQueryBuilder('repost')
    .innerJoinAndSelect('repost.post', 'post')
    .leftJoinAndSelect('repost.user', 'user')
    .where('repost.userId = :reposterId', { reposterId })
    .andWhere('(post.privacy = :privacy OR post.userId = :viewerId)', {
      privacy: PostPrivacy.PUBLIC,
      viewerId,
    })
    .orderBy('repost.createdOn', 'DESC')
    .skip(pageOptions(query).skip)
    .take(pageOptions(query).take)
    .getMany();

export const createComment = async (userId: string, postId: string, input: CreateCommentInput) => {
  const post = await assertCanView(postId, userId);
  if (!input.text?.trim() || input.text.trim().length > 2_000) {
    throw new PostServiceError('Comment text is required and must be 2,000 characters or fewer.');
  }
  if (input.parentCommentId) {
    assertUuid(input.parentCommentId, 'parent comment id');
    const parent = await AppDataSource.getRepository(Comment).findOne({ where: { id: input.parentCommentId } });
    if (!parent || parent.postId !== post.id || parent.type !== CommentType.POST) {
      throw new PostServiceError('Parent comment does not belong to this post.');
    }
  }
  return AppDataSource.getRepository(Comment).save({
    userId, type: CommentType.POST, postId, journalId: null,
    parentCommentId: input.parentCommentId ?? null, text: input.text.trim(),
  });
};

export const listComments = async (postId: string, viewerId: string, query: PostListQuery, parentCommentId?: string) => {
  await assertCanView(postId, viewerId);
  return AppDataSource.getRepository(Comment).find({
    where: { postId, type: CommentType.POST, parentCommentId: parentCommentId ?? IsNull() },
    relations: { user: true }, order: { createdOn: 'ASC' }, ...pageOptions(query),
  });
};

export const updateComment = async (userId: string, commentId: string, text: string) => {
  const comment = await AppDataSource.getRepository(Comment).findOne({ where: { id: commentId } });
  if (!comment) throw new PostServiceError('Comment not found.', 404);
  if (comment.userId !== userId) throw new PostServiceError('Only the comment creator can edit it.', 403);
  if (!text?.trim() || text.trim().length > 2_000) throw new PostServiceError('Comment text is required and must be 2,000 characters or fewer.');
  comment.text = text.trim();
  return AppDataSource.getRepository(Comment).save(comment);
};

export const deleteComment = async (userId: string, commentId: string) => {
  const comment = await AppDataSource.getRepository(Comment).findOne({ where: { id: commentId } });
  if (!comment) throw new PostServiceError('Comment not found.', 404);
  if (comment.userId !== userId) throw new PostServiceError('Only the comment creator can delete it.', 403);
  await AppDataSource.getRepository(Comment).delete(commentId);
};

export const createLike = async (userId: string, targetType: LikeTargetType, targetId: string, input: CreateLikeInput) => {
  if (!Object.values(LikeType).includes(input.likeType)) throw new PostServiceError('Invalid reaction type.');
  let postId: string | null = null;
  let commentId: string | null = null;
  if (targetType === LikeTargetType.POST) {
    await assertCanView(targetId, userId);
    postId = targetId;
  } else if (targetType === LikeTargetType.COMMENT) {
    const comment = await AppDataSource.getRepository(Comment).findOne({ where: { id: targetId } });
    if (!comment?.postId) throw new PostServiceError('Comment not found.', 404);
    await assertCanView(comment.postId, userId);
    commentId = targetId;
  } else throw new PostServiceError('Journal reactions are not implemented.', 501);
  const repo = AppDataSource.getRepository(Like);
  const where = {
    userId, type: targetType,
    postId: postId ?? IsNull(), journalId: IsNull(), commentId: commentId ?? IsNull(),
  };
  const existing = await repo.findOne({ where });
  if (existing) {
    existing.likeType = input.likeType;
    return repo.save(existing);
  }
  return repo.save(repo.create({
    userId, type: targetType, postId, journalId: null, commentId, likeType: input.likeType,
  }));
};

export const removeLike = async (userId: string, targetType: LikeTargetType, targetId: string) => {
  if (targetType === LikeTargetType.POST) await assertCanView(targetId, userId);
  else if (targetType === LikeTargetType.COMMENT) {
    const comment = await AppDataSource.getRepository(Comment).findOne({ where: { id: targetId } });
    if (!comment?.postId) throw new PostServiceError('Comment not found.', 404);
    await assertCanView(comment.postId, userId);
  } else throw new PostServiceError('Journal reactions are not implemented.', 501);
  await AppDataSource.getRepository(Like).delete({
    userId, type: targetType,
    ...(targetType === LikeTargetType.POST ? { postId: targetId } : { commentId: targetId }),
  });
};

export const reactionSummary = async (userId: string, targetType: LikeTargetType, targetId: string) => {
  if (targetType === LikeTargetType.POST) await assertCanView(targetId, userId);
  else {
    const comment = await AppDataSource.getRepository(Comment).findOne({ where: { id: targetId } });
    if (!comment?.postId) throw new PostServiceError('Comment not found.', 404);
    await assertCanView(comment.postId, userId);
  }
  const repo = AppDataSource.getRepository(Like);
  const column = targetType === LikeTargetType.POST ? 'postId' : 'commentId';
  const rows = await repo.createQueryBuilder('like').select('like.likeType', 'type')
    .addSelect('COUNT(*)', 'count').where('like.type = :type', { type: targetType })
    .andWhere(`like."${column}" = :targetId`, { targetId }).groupBy('like.likeType')
    .getRawMany<{ type: LikeType; count: string }>();
  const current = await repo.findOne({ where: {
    userId, type: targetType,
    postId: targetType === LikeTargetType.POST ? targetId : IsNull(),
    journalId: IsNull(),
    commentId: targetType === LikeTargetType.COMMENT ? targetId : IsNull(),
  } });
  const [commentCount, repostCount] = targetType === LikeTargetType.POST
    ? await Promise.all([
      AppDataSource.getRepository(Comment).count({ where: { postId: targetId, type: CommentType.POST, parentCommentId: IsNull() } }),
      AppDataSource.getRepository(PostRepost).count({ where: { postId: targetId } }),
    ])
    : [0, 0];
  return {
    counts: rows.reduce<Record<string, number>>((result, row) => ({ ...result, [row.type]: Number(row.count) }), {}),
    currentReaction: current?.likeType ?? null,
    commentCount,
    repostCount,
  };
};

export const listLikes = async (
    userId: string,
    targetType: LikeTargetType,
    targetId: string,
    query: PostListQuery,
  ) => {
    if (targetType === LikeTargetType.POST) await assertCanView(targetId, userId);
    else {
      const comment = await AppDataSource.getRepository(Comment).findOne({ where: { id: targetId } });
      if (!comment?.postId) throw new PostServiceError('Comment not found.', 404);
      await assertCanView(comment.postId, userId);
    }
    const column = targetType === LikeTargetType.POST ? 'postId' : 'commentId';
    return AppDataSource.getRepository(Like).createQueryBuilder('like')
      .leftJoinAndSelect('like.user', 'user')
      .where('like.type = :type', { type: targetType })
      .andWhere(`like."${column}" = :targetId`, { targetId })
      .orderBy('like.createdOn', 'DESC')
      .skip(pageOptions(query).skip)
      .take(pageOptions(query).take)
      .getMany();
};
