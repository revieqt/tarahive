import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

@Entity('room_members')
@Unique(['roomId', 'userId'])
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

  @Column({ type: 'varchar', length: 100 })
  nickname!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}