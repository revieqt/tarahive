
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Expense } from './expenses.entity';
import { User } from '../user/user.entity';

export enum SharedExpenseStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

@Entity('shared_expenses')

// Prevent duplicate allocations to the same user
@Unique('UQ_shared_expenses_expense_user', ['expensesId', 'userId'])

// Retrieve all shares belonging to an expense
@Index('IDX_shared_expenses_expensesId', ['expensesId'])

// Retrieve a user's shared expenses
@Index('IDX_shared_expenses_user_createdOn', [
  'userId',
  'createdOn',
])

// Retrieve pending or paid expenses for a user
@Index('IDX_shared_expenses_user_status_createdOn', [
  'userId',
  'status',
  'createdOn',
])

@Check('CHK_shared_expenses_amount_positive', '"amount" > 0')
export class SharedExpense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Expense being shared
  @Column({ type: 'uuid' })
  expensesId!: string;

  @ManyToOne(
    () => Expense,
    (expense) => expense.sharedExpenses,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'expensesId' })
  expense!: Expense;

  // User responsible for this allocated share
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Amount allocated to this user
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
    type: 'text',
    nullable: true,
  })
  note!: string | null;

  @Column({
    type: 'enum',
    enum: SharedExpenseStatus,
    enumName: 'shared_expense_status_enum',
    default: SharedExpenseStatus.PENDING,
  })
  status!: SharedExpenseStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdOn!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedOn!: Date;
}
