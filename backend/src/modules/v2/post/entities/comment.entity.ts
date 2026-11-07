import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/user.entity';
import { Post } from './post.entity';

export enum CommentType {
  POST = 'post',
  JOURNAL = 'journal',
}

@Entity('comments')
@Index('IDX_comments_post_id_created_on', ['postId', 'createdOn'])
@Index('IDX_comments_journal_id_created_on', ['journalId', 'createdOn'])
@Index('IDX_comments_parent_comment_id_created_on', [
  'parentCommentId',
  'createdOn',
])
@Index('IDX_comments_user_id_created_on', ['userId', 'createdOn'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // User who created the comment
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Determines which module owns the comment
  @Column({
    type: 'enum',
    enum: CommentType,
    enumName: 'comment_type_enum',
  })
  type!: CommentType;

  // Associated post (when type is POST)
  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  postId!: string | null;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post!: Post | null;

  // Associated journal (when type is JOURNAL)
  // Foreign key relationship will be added when Journal entity is implemented.
  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  journalId!: string | null;

  // Parent comment (for replies)
  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  parentCommentId!: string | null;

  @ManyToOne(() => Comment, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment!: Comment | null;

  // Comment content
  @Column({
    type: 'text',
  })
  text!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdOn!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedOn!: Date;
}