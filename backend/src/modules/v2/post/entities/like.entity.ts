import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { User } from '../../user/user.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';

export enum LikeTargetType {
  POST = 'post',
  JOURNAL = 'journal',
  COMMENT = 'comment',
}

export enum LikeType {
  LIKED = 'liked',
  LOVED = 'loved',
  AMAZED = 'amazed',
  LAUGHED = 'laughed',
  ANGRY = 'angry',
}

@Entity('likes')
@Unique('UQ_likes_user_target', [
  'userId',
  'type',
  'postId',
  'journalId',
  'commentId',
])
@Index('IDX_likes_post_id_created_on', ['postId', 'createdOn'])
@Index('IDX_likes_journal_id_created_on', ['journalId', 'createdOn'])
@Index('IDX_likes_comment_id_created_on', ['commentId', 'createdOn'])
@Index('IDX_likes_user_id_created_on', ['userId', 'createdOn'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // User who reacted
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Determines what content is being liked
  @Column({
    type: 'enum',
    enum: LikeTargetType,
    enumName: 'like_target_type_enum',
  })
  type!: LikeTargetType;

  // Associated post
  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  postId!: string | null;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post!: Post | null;

  // Associated journal (future implementation)
  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  journalId!: string | null;

  // Associated comment
  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  commentId!: string | null;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment!: Comment | null;

  // Reaction type
  @Column({
    type: 'enum',
    enum: LikeType,
    enumName: 'like_type_enum',
    default: LikeType.LIKED,
  })
  likeType!: LikeType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdOn!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedOn!: Date;
}