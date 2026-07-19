import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ItineraryPrivacy, ItineraryStatus, CollaboratorPermissions } from './itinerary.types';

@Entity({ name: 'itineraries' })
export class Itinerary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  title!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  type!: string;

  @Column({
    type: 'timestamp',
  })
  startDate!: Date;

  @Column({
    type: 'timestamp',
  })
  endDate!: Date;

  @Column({
    type: 'enum',
    enum: ItineraryStatus,
    default: ItineraryStatus.ACTIVE,
  })
  status!: ItineraryStatus;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  content?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ItineraryPrivacy,
    default: ItineraryPrivacy.PRIVATE,
  })
  privacy!: ItineraryPrivacy;

  @Column({
    type: 'enum',
    enum: CollaboratorPermissions,
    default: CollaboratorPermissions.VIEW,
  })
  collaboratorPermissions!: CollaboratorPermissions;

  @Column({
    type: 'integer',
    default: 1,
  })
  v!: number;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdOn!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedOn!: Date;
}