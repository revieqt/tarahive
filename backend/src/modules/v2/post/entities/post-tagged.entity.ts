import {
    Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Post } from './post.entity';
import { User } from '../../user/user.entity';

@Entity('post_tagged')
@Unique('UQ_post_tagged_post_user', ['postId', 'userId'])
@Index('IDX_post_tagged_user_id_created_on', ['userId', 'createdOn'])
export class PostTagged {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  postId!: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post!: Post;

  @Column({ type: 'uuid' })
  userId!: string;
    
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'boolean',
    default: false,
  })
  hideFromProfile!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdOn!: Date;
}