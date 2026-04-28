import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";
import { UserRole, UserSettings, UserEmergencyState } from "./user.types";

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

  @Column({ type: "enum", enum: UserRole, default: UserRole.TRAVELER })
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
      pushNotifications: true,
      locationSharing: true,
    },
  })
  emergencyState!: UserEmergencyState;

  @Column({
    type: "jsonb",
    default: {
      pushNotifications: true,
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

  // ======================
  // TRACKING / AUDIT
  // ======================

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}