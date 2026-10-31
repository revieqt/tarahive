
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Wallet } from './wallet.entity';
import { User } from '../user/user.entity';
import { SharedExpense } from './shared-expense.entity';

@Entity('expenses')

// Retrieve expenses belonging to a wallet, newest first
@Index('IDX_expenses_wallet_createdOn', ['walletId', 'createdOn'])

// Retrieve expenses created by a user
@Index('IDX_expenses_user_createdOn', ['userId', 'createdOn'])

// Filter expenses by wallet and creator
@Index('IDX_expenses_wallet_user_createdOn', [
  'walletId',
  'userId',
  'createdOn',
])

@Check('CHK_expenses_amount_positive', '"amount" > 0')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Wallet where the expense is recorded
  @Column({ type: 'uuid' })
  walletId!: string;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet!: Wallet;

  // User who created the expense
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  amount!: number;

  @Column({
    type: 'varchar',
    length: 150,
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  // Users who share this expense
  @OneToMany(
    () => SharedExpense,
    (sharedExpense) => sharedExpense.expense,
  )
  sharedExpenses!: SharedExpense[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdOn!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedOn!: Date;
}
