
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { MultiPolygon } from 'geojson';

@Entity('countries')
@Index('UQ_countries_iso2', ['iso2'], { unique: true })
@Index('UQ_countries_iso3', ['iso3'], { unique: true })
@Index('UQ_countries_numeric_code', ['numericCode'], {
  unique: true,
})
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  officialName!: string | null;

  @Column({
    type: 'char',
    length: 2,
    nullable: true,
  })
  iso2!: string | null;

  @Column({
    type: 'char',
    length: 3,
    nullable: true,
  })
  iso3!: string | null;

  @Column({
    type: 'char',
    length: 3,
    nullable: true,
  })
  numericCode!: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  capital!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  phoneCodes!: string[] | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  currencies!: Record<string, {
    name: string;
    symbol: string | null;
  }> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  languages!: Record<string, string> | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  region!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  subregion!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  nativeNames!: Record<string, {
    official: string;
    common: string;
  }> | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude!: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude!: string | null;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  boundary!: MultiPolygon | null;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  isIndependent!: boolean | null;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  isUNMember!: boolean | null;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
