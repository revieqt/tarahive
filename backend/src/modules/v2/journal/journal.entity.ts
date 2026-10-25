// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   JoinColumn,
//   ManyToOne,
// } from 'typeorm';
// import { User } from '../user/user.entity';
// // import { ItineraryPrivacy, ItineraryStatus } from './itinerary.types';

// @Entity({ name: 'journal' })
// export class Journal {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @ManyToOne(() => User, {
//     nullable: false,
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'userId' })
//   user!: User;

//   @Column({
//     type: 'varchar',
//     nullable: false,
//   })
//   title!: string;

//   @Column({
//     type: 'varchar',
//     nullable: false,
//   })
//   type!: string;

//   @Column({
//     type: 'enum',
//     enum: ItineraryStatus,
//     default: ItineraryStatus.ACTIVE,
//   })
//   status!: ItineraryStatus;

//   @Column({
//     type: "jsonb",
//     nullable: true,
//   })
//   content?: unknown;

//   @Column({
//     type: 'enum',
//     enum: ItineraryPrivacy,
//     default: ItineraryPrivacy.PRIVATE,
//   })
//   privacy!: ItineraryPrivacy;

//   @Column({
//     type: 'integer',
//     default: 1,
//   })
//   v!: number;

//   @CreateDateColumn({
//     type: 'timestamp',
//   })
//   createdOn!: Date;

//   @UpdateDateColumn({
//     type: 'timestamp',
//   })
//   updatedOn!: Date;
// }