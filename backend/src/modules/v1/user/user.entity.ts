import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Provider, UserStatus, UserType } from "./user.types";

@Entity("users")
@Index(["email"], { unique: true })
@Index(["username"], { unique: true })
@Index(["googleId"])

export class User {
  // ======================
  // CORE IDENTITY
  // ======================

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  fname!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  lname?: string;

  @Column({ type: "varchar", length: 100, nullable: true, unique: true })
  username?: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: true, select: false })
  password?: string;

  @Column({ type: "enum", enum: Provider, default: Provider.EMAIL })
  provider!: Provider;

  @Column({ type: "varchar", nullable: true, unique: true })
  googleId?: string;

  @Column({ type: "varchar", nullable: true })
  contactNumber?: string;

  @Column({ type: "date", nullable: true })
  bdate?: Date;

  @Column({ type: "varchar", default: "" })
  gender!: string;

  @Column({ type: "varchar", nullable: true })
  profileImage?: string;

  // ======================
  // USER PROFILE DATA
  // ======================

  @Column({ type: "text", default: "" })
  bio!: string;

  @Column({ type: "varchar" })
  type!: UserType;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE})
  status!: UserStatus;

  @Column({ type: "boolean", default: false })
  isProUser!: boolean;

  // ======================
  // GAMIFICATION (TARA G EXP SYSTEM)
  // ======================

  @Column({ type: "int", default: 0 })
  expPoints!: number;

  // ======================
  // RELATION DATA (Mongo arrays → Postgres array/jsonb)
  // ======================

  @Column({ type: "text", array: true, default: [] })
  interests!: string[];

  // ======================
  // SAFETY SYSTEM (TaraG core feature)
  // ======================

  @Column({
    type: "jsonb",
    default: {
      isInAnEmergency: false,
      emergencyContact: {},
      delivery: {
        isEmailEnabled: false,
        isSMSEnabled: false,
      },
    },
  })
  safetyState!: {
    isInAnEmergency: boolean;
    emergencyType?: string;
    emergencyNote?: string;
    emergencyContact?:{
      email?: string;
      phone?: string;
    };
    delivery?: {
      isEmailEnabled: boolean;
      isSMSEnabled: boolean;
    };
    lastKnownLocation?: {
      locationName: string;
      latitude: number;
      longitude: number;
    };
  };

  // ======================
  // DEVICE INFO (JSONB array)
  // ======================

  @Column({
    type: "jsonb",
    default: [],
  })
  device!: Array<{
    deviceId: string;
    brand: string;
    model: string;
    os: string;
    type: string;
    appVersion?: string;
  }>;

  // ======================
  // SETTINGS
  // ======================

  @Column({
    type: "jsonb",
    default: {
      visibility: {
        isProfilePublic: true,
        isPersonalInfoPublic: true,
        isTravelInfoPublic: true,
      },
      personalization: {
        pushNotifications: true,
        locationSharing: false,
      },
      security: {
        is2FAEnabled: false,
      },
      taraBuddy: {
        isTaraBuddyEnabled: false,
      },
    },
  })
  settings!: {
    visibility: {
      isProfilePublic: boolean;
      isPersonalInfoPublic: boolean;
      isTravelInfoPublic: boolean;
    };
    personalization: {
      pushNotifications: boolean;
      locationSharing: boolean;
    };
    security: {
      is2FAEnabled: boolean;
    };
    taraBuddy: {
      isTaraBuddyEnabled: boolean;
      preferredGender?: string;
      preferredDistance?: number;
      preferredAgeRange?: number[];
      preferredZodiac?: string[];
    };
  };

  // ======================
  // AUDIT FIELDS
  // ======================

  @CreateDateColumn({ name: "created_on" })
  createdOn!: Date;

  @UpdateDateColumn({ name: "updated_on" })
  updatedOn!: Date;

  // ======================
  // SECURITY / SESSION CONTROL
  // ======================

  @Column({ type: "int", default: 1 })
  tv!: number;
}