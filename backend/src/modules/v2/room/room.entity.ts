import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Itinerary } from '../itinerary/itinerary.entity';

export enum RoomPrivacy {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  itineraryId!: string | null;

  @ManyToOne(() => Itinerary, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'itineraryId' })
  itinerary!: Itinerary | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: RoomPrivacy,
    default: RoomPrivacy.PRIVATE,
  })
  privacy!: RoomPrivacy;

  @Column({
    type: 'varchar',
    length: 7,
    default: '#FF6B6B',
  })
  themeColor!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}