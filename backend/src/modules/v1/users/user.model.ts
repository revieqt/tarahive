import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: string;

  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };

  locationSharing: boolean;
}

@Entity({ name: "users" })
@Index(["email"], { unique: true })
export class User {
  // ======================
  // CORE IDENTITY
  // ======================

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, select: false })
  password!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  firstName?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  lastName?: string;

  // ======================
  // AUTH / RBAC
  // ======================

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: "boolean", default: false })
  isEmailVerified!: boolean;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  // ======================
  // TARA G SETTINGS (JSONB)
  // ======================

  @Column({
    type: "jsonb",
    default: {
      theme: "system",
      language: "en",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      locationSharing: true,
    },
  })
  settings!: UserSettings;

  // ======================
  // EXP / LEVEL SYSTEM
  // ======================

  @Column({ type: "int", default: 1 })
  level!: number;

  @Column({ type: "int", default: 0 })
  currentExp!: number;

  @Column({ type: "int", default: 0 })
  totalExp!: number;

  @Column({ type: "varchar", length: 50, default: "Rookie Traveler" })
  title!: string;

  // ======================
  // TRACKING / ANALYTICS
  // ======================

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt?: Date;

  // ======================
  // AUDIT FIELDS
  // ======================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}