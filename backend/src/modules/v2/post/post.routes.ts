import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import {
  addTaggedUsersController, commentsController, createCommentController,
  createPostController, createRepostController, deleteCommentController, deletePostController,
  exploreController, feedController, getPostController, itineraryPostsController, likeController,
  likesController, likeSummaryController, removeRepostController, removeTaggedUserController, repliesController,
  replyController, repostsController, taggedPostsController, taggedUsersController,
  taggedVisibilityController, unlikeController, updateCommentController, updatePostController,
  userPostsController, userRepostsController,
} from './post.controller';

const router = Router();
router.use(authMiddleware);

router.post('/', createPostController);
router.get('/feed', feedController);
router.get('/explore', exploreController);
router.get('/user/:userId/reposts', userRepostsController);
router.get('/user/:userId', userPostsController);
router.get('/tagged/:userId', taggedPostsController);
router.get('/itinerary/:itineraryId', itineraryPostsController);
router.get('/:postId', getPostController);
router.patch('/:postId', updatePostController);
router.delete('/:postId', deletePostController);

router.get('/:postId/details', getPostController);
router.post('/:postId/tagged-users', addTaggedUsersController);
router.get('/:postId/tagged-users', taggedUsersController);
router.delete('/:postId/tagged-users/:userId', removeTaggedUserController);
router.patch('/:postId/tagged-users/:userId/profile-visibility', taggedVisibilityController);

router.post('/:postId/repost', createRepostController);
router.delete('/:postId/repost', removeRepostController);
router.get('/:postId/reposts', repostsController);

router.post('/:postId/comments', createCommentController);
router.get('/:postId/comments', commentsController);
router.get('/:postId/comments/:commentId/replies', repliesController);
router.post('/:postId/comments/:commentId/replies', replyController);

router.post('/:postId/likes', likeController('post'));
router.delete('/:postId/likes', unlikeController('post'));
router.get('/:postId/likes', likesController('post'));
router.get('/:postId/likes/summary', likeSummaryController('post'));

router.patch('/comments/:commentId', updateCommentController);
router.delete('/comments/:commentId', deleteCommentController);
router.post('/comments/:commentId/likes', likeController('comment'));
router.delete('/comments/:commentId/likes', unlikeController('comment'));
router.get('/comments/:commentId/likes', likesController('comment'));
router.get('/comments/:commentId/likes/summary', likeSummaryController('comment'));

export default router;
