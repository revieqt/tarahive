import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from '../user/user.entity';
import { Itinerary } from './itinerary.entity';
import { CollaboratorPermissions } from './itinerary.types';
import { CollaboratorStatus } from './itinerary.types';

@Entity({ name: 'itinerary_collaborators' })
@Index(['itinerary', 'user'], { unique: true })
@Index(['user'])
@Index(['status'])
@Index(['itinerary'])

export class ItineraryCollaborator {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Itinerary, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'itineraryId' })
  itinerary!: Itinerary;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: CollaboratorPermissions,
    default: CollaboratorPermissions.VIEW,
  })
  permission!: CollaboratorPermissions;

  @Column({
    type: 'enum',
    enum: CollaboratorStatus,
    default: CollaboratorStatus.PENDING,
  })
  status!: CollaboratorStatus;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdOn!: Date;
}