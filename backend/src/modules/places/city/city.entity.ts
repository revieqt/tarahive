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
import type { MultiPolygon } from 'geojson';

import { Country } from '../country/country.entity';
import { Division } from '../division/division.entity';

@Entity('cities')
@Index('IDX_cities_country_id', ['countryId'])
@Index('IDX_cities_division_id', ['divisionId'])
@Index('IDX_cities_country_name', ['countryId', 'name'])
@Index('UQ_cities_country_code', ['countryId', 'code'], { unique: true })
export class City {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Country relationship
  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'countryId' })
  country!: Country;

  // First-level administrative division (Province, State, etc.)
  @Column({ type: 'uuid', nullable: true })
  divisionId!: string | null;

  @ManyToOne(() => Division, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'divisionId' })
  division!: Division | null;

  // Basic information
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  officialName!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  code!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type!: string | null; // City, Municipality, Town, etc.

  @Column({ type: 'varchar', length: 200, nullable: true })
  nativeName!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // Geographic information
  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  boundary!: MultiPolygon | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: string | null;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}