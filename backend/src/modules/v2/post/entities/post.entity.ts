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
import { Itinerary } from '../../itinerary/itinerary.entity';

export enum PostPrivacy {
  PUBLIC = 'public',
  ONLY_ME = 'only_me',
  FOLLOWERS = 'followers',
  FRIENDS_ONLY = 'friends_only',
}

@Entity('posts')
@Index('IDX_posts_user_id_created_on', ['userId', 'createdOn'])
@Index('IDX_posts_privacy_created_on', ['privacy', 'createdOn'])
@Index('IDX_posts_itinerary_id', ['itineraryId'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  tags!: string[] | null;

  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  itineraryId!: string | null;

  @ManyToOne(() => Itinerary, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'itineraryId' })
  itinerary!: Itinerary | null;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  text!: string | null;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
    default: null,
  })
  images!: string[] | null;

  @Column({
    type: 'enum',
    enum: PostPrivacy,
    enumName: 'post_privacy_enum',
    default: PostPrivacy.PUBLIC,
  })
  privacy!: PostPrivacy;

  @Column({
    type: 'boolean',
    default: false,
  })
  hideFromProfile!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdOn!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedOn!: Date;
}