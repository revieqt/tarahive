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

export enum ItineraryStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DONE = 'done',
}

export interface Address {
  country?: string;
  region?: string;
  province?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  postal_code?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  locationName: string;
  address?: Address;
  note?: string;
}

export interface DailyItinerary {
  date: Date;
  locations: Location[];
}

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
    type: 'text',
    default: '',
  })
  description!: string;

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
    type: 'boolean',
    default: false,
  })
  planDaily!: boolean;

  /**
   * If planDaily = false:
   * [
   *   {
   *     latitude,
   *     longitude,
   *     locationName,
   *     address,
   *     note
   *   }
   * ]
   *
   * If planDaily = true:
   * [
   *   {
   *     date,
   *     locations: [...]
   *   }
   * ]
   */
  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  locations!: Location[] | DailyItinerary[];

  @Column({
    type: 'boolean',
    default: true,
  })
  isPrivate!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdOn!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedOn!: Date;
}