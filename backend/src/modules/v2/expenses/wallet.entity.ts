
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

@Entity('wallets')

// User wallet listing and chronological sorting
@Index('IDX_wallets_user_createdOn', ['userId', 'createdOn'])

// Room wallet listing and chronological sorting
@Index('IDX_wallets_room_createdOn', ['roomId', 'createdOn'])

// Filter wallets by user and room
@Index('IDX_wallets_user_room_createdOn', [
  'userId',
  'roomId',
  'createdOn',
])

@Check('CHK_wallets_amountLimit_nonnegative', '"amountLimit" >= 0')
@Check(
  'CHK_wallets_color_hex',
  '"color" ~ \'^#[0-9A-Fa-f]{6}$\'',
)

export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Creator of the wallet
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Null for personal wallets
  @Column({ type: 'uuid', nullable: true })
  roomId!: string | null;

  @ManyToOne(() => Room, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roomId' })
  room!: Room | null;

  // 0 means no spending limit
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  amountLimit!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  // Wallet display color
  @Column({
    type: 'varchar',
    length: 7,
    default: '#4CAF50',
  })
  color!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdOn!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedOn!: Date;
}
