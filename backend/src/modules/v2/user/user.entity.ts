import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from "typeorm";

import { Auth } from "../auth/auth.entity";
import { UserStatus, UserType } from "./user.types";

@Entity("users")
@Index(["username"], { unique: true })
@Index(["email"], { unique: true })
export class User {
  // ======================
  // CORE IDENTITY
  // ======================

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 254 })
  email!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  fname?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  lname?: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
    unique: true,
  })
  username?: string;

  @Column({ type: "varchar", nullable: true })
  profileImage?: string;

  // ======================
  // PROFILE DATA
  // ======================

  @Column({ type: "date", nullable: true })
  bdate?: Date;

  @Column({ type: "varchar", nullable: true })
  gender?: string;

  @Column({ type: "text", default: "" })
  bio!: string;

  @Column({ type: "varchar" })
  type!: UserType;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  // ======================
  // TRAVEL / PERSONALIZATION
  // ======================

  @Column({
    type: "text",
    array: true,
    default: [],
  })
  interests!: string[];

  // ======================
  // ACCOUNT
  // ======================

  @Column({
    type: "boolean",
    default: false,
  })
  isProUser!: boolean;

  // ======================
  // GAMIFICATION
  // ======================

  @Column({
    type: "int",
    default: 0,
  })
  expPoints!: number;

  // ======================
  // SAFETY SYSTEM
  // ======================

  @Column({
    type: "jsonb",
    default: {
      isInAnEmergency: false,
      emergencyContact: {},
      delivery: {
        isEmailEnabled: false,
        isSMSEnabled: false,
        alertLang: "en",
      },
    },
  })
  safetyState!: {
    isInAnEmergency: boolean;

    emergencyType?: string;

    emergencyNote?: string;

    emergencyContact?: {
      email?: string;
      phone?: string;
    };

    delivery?: {
      isEmailEnabled: boolean;
      isSMSEnabled: boolean;
      alertLang: string;
    };

    lastKnownLocation?: {
      locationName: string;
      latitude: number;
      longitude: number;
    };
  };

  // ======================
  // DEVICE INFO
  // ======================

  @Column({
    type: "jsonb",
    default: [],
  })
  devices!: Array<{
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
  // AUTHENTICATION
  // ======================

  @OneToMany(() => Auth, (auth) => auth.user)
  authMethods!: Auth[];

  // ======================
  // AUDIT
  // ======================

  @CreateDateColumn({
    name: "created_on",
  })
  createdOn!: Date;

  @UpdateDateColumn({
    name: "updated_on",
  })
  updatedOn!: Date;

  // ======================
  // SESSION CONTROL
  // ======================

  @Column({
    type: "int",
    default: 1,
  })
  tv!: number;
}