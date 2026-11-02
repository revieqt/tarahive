
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

@Entity('divisions')
@Index('IDX_divisions_country_id', ['countryId'])
@Index('IDX_divisions_country_name', ['countryId', 'name'])
@Index('UQ_divisions_country_code', ['countryId', 'code'], {
  unique: true,
})
export class Division {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'countryId' })
  country!: Country;

  // Common administrative division name
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  // Full official name, if available
  @Column({ type: 'varchar', length: 200, nullable: true })
  officialName!: string | null;

  // ISO 3166-2, PSGC, or country-specific code
  @Column({ type: 'varchar', length: 30, nullable: true })
  code!: string | null;

  // Province, State, Prefecture, Governorate, etc.
  @Column({ type: 'varchar', length: 50, nullable: true })
  type!: string | null;

  // Name in the local language
  @Column({ type: 'varchar', length: 200, nullable: true })
  nativeName!: string | null;

  // Administrative boundary represented as GeoJSON MultiPolygon.
  // Coordinates use WGS84 (EPSG:4326).
  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  boundary!: MultiPolygon | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
