import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Device, LogSeverity, App } from "./audit.types";

@Entity("logs")
export class Log {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "varchar", nullable: true })
  userId?: string;

  @Index()
  @Column({ type: "varchar" })
  action!: string;

  @Index()
  @Column({ type: "varchar" })
  module!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", nullable: true })
  resourceType?: string;

  @Column({ type: "varchar", nullable: true })
  resourceId?: string;

  @Column({ type: "boolean", default: true })
  success!: boolean;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @Column({ type: "varchar", nullable: true })
  ip?: string;

  @Column({ type: "varchar", nullable: true })
  platform?: string;

  @Column({ type: "jsonb", nullable: true })
  device?: Device;

  @Column({ type: "jsonb", nullable: true })
  appInfo?: App;

  @Index()
  @Column({
    type: "enum",
    enum: LogSeverity,
    default: LogSeverity.INFO,
  })
  severity!: LogSeverity;

  @Column({ type: "varchar", nullable: true })
  metadataID?: string;

  @Index()
  @Column({ type: "varchar", nullable: true })
  requestId?: string;

  @CreateDateColumn({ type: "timestamp" })
  createdOn!: Date;
}