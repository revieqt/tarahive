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

@Entity('post_reposts')
@Unique('UQ_post_reposts_user_post', ['userId', 'postId'])
@Index('IDX_post_reposts_user_id_created_on', ['userId', 'createdOn'])
@Index('IDX_post_reposts_post_id_created_on', ['postId', 'createdOn'])
export class PostRepost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // User who reposted the post
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Original post being reposted
  @Column({ type: 'uuid' })
  postId!: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post!: Post;

  // Optional repost caption
  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  caption!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdOn!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedOn!: Date;
}