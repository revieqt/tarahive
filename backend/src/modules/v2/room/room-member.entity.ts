import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Room } from './room.entity';
import { User } from '../user/user.entity';

export enum RoomMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum RoomMemberStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  REQUESTED = 'REQUESTED',
}

@Entity('room_members')
@Unique(['roomId', 'userId'])
@Index(['userId', 'roomId'])
@Index(['roomId', 'status'])
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: RoomMemberRole,
    default: RoomMemberRole.MEMBER,
  })
  role!: RoomMemberRole;

  @Column({
    type: 'enum',
    enum: RoomMemberStatus,
    default: RoomMemberStatus.INVITED,
  })
  status!: RoomMemberStatus;

  @Column({ type: 'varchar', length: 100 })
  nickname!: string;

  @CreateDateColumn()
  createdOn!: Date;

  @UpdateDateColumn()
  updatedOn!: Date;
}