import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

import { User } from "../user/user.entity";
import { AuthProvider } from "./auth.types";

@Entity("auth")
@Index(["provider", "providerId"], {
  unique: true,
})
export class Auth {
  // ======================
  // ID
  // ======================

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // ======================
  // USER RELATION
  // ======================

  @Column({
    name: "user_id",
    type: "uuid",
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.authMethods, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "user_id",
  })
  user!: User;

  // ======================
  // AUTH PROVIDER
  // ======================

  @Column({
    type: "enum",
    enum: AuthProvider,
  })
  provider!: AuthProvider;

  @Column({
    name: "provider_id",
    type: "varchar",
  })
  providerId!: string;

  // ======================
  // PROVIDER DATA
  // ======================

  @Column({
    type: "varchar",
    nullable: true,
  })
  email?: string;

  @Column({
    name: "phone_number",
    type: "varchar",
    nullable: true,
  })
  phoneNumber?: string;

  // ======================
  // VERIFICATION
  // ======================

  @Column({
    type: "boolean",
    default: true,
  })
  isVerified!: boolean;

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
}