import { AppDataSource } from '../../../infrastructure/postgres/postgres';
import { In, EntityManager } from 'typeorm';
import { User } from '../user/user.entity';
import { RoomMember, RoomMemberStatus } from '../room/room-member.entity';
import { Expense } from './expenses.entity';
import { SharedExpense, SharedExpenseStatus } from './shared-expense.entity';
import { Wallet } from './wallet.entity';
import {
  CreateExpenseRequest,
  CreateWalletRequest,
  SharedExpenseRequest,
  UpdateExpenseRequest,
  UpdateWalletRequest,
} from './expenses.types';

const walletRepo = AppDataSource.getRepository(Wallet);

export const getUserWallets = async (userId: string): Promise<Wallet[]> =>
  walletRepo.find({
    where: { userId },
    order: { createdOn: 'DESC' },
  });

export class WalletValidationError extends Error {}
export class WalletNotFoundError extends Error {}
export class WalletForbiddenError extends Error {}

const validationError = (message: string): never => {
  throw new WalletValidationError(message);
};

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const validateAmountLimit = (amountLimit: unknown): void => {
  if (
    typeof amountLimit !== 'number' ||
    !Number.isFinite(amountLimit) ||
    amountLimit < 0 ||
    Math.round(amountLimit * 100) !== amountLimit * 100
  ) {
    validationError('amountLimit must be a non-negative number with at most two decimal places');
  }
};

const validateColor = (color: unknown): void => {
  if (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    validationError('color must be a valid hexadecimal color');
  }
};

const validateName = (name: unknown): void => {
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
    validationError('name is required and must be 100 characters or fewer');
  }
};

const assertActiveRoomMember = async (roomId: string, userId: string): Promise<void> => {
  if (!isUuid(roomId)) {
    validationError('Invalid roomId');
  }

  const member = await AppDataSource.getRepository(RoomMember).findOne({
    where: { roomId, userId, status: RoomMemberStatus.ACTIVE },
  });

  if (!member) {
    throw new WalletForbiddenError('You must be an active member of the room');
  }
};

export const createWallet = async (
  userId: string,
  request: CreateWalletRequest,
): Promise<Wallet> => {
  if (!request || typeof request !== 'object') {
    validationError('Request body is required');
  }

  validateName(request.name);

  const amountLimit = request.amountLimit ?? 0;
  validateAmountLimit(amountLimit);

  const color = request.color ?? '#4CAF50';
  validateColor(color);

  if (Object.prototype.hasOwnProperty.call(request, 'roomId')) {
    if (typeof request.roomId !== 'string' || request.roomId.length === 0) {
      validationError('roomId must be a valid UUID');
    }
    await assertActiveRoomMember(request.roomId!, userId);
  }
  if (
    request.description !== undefined &&
    request.description !== null &&
    typeof request.description !== 'string'
  ) {
    validationError('description must be a string or null');
  }

  const wallet = walletRepo.create({
    userId,
    roomId: request.roomId ?? null,
    amountLimit,
    name: request.name.trim(),
    description: request.description ?? null,
    color,
  });

  return walletRepo.save(wallet);
};

const getOwnedWallet = async (walletId: string, userId: string): Promise<Wallet> => {
  if (!isUuid(walletId)) {
    validationError('Invalid wallet id');
  }

  const wallet = await walletRepo.findOne({ where: { id: walletId } });
  if (!wallet) {
    throw new WalletNotFoundError('Wallet not found');
  }
  if (wallet.userId !== userId) {
    throw new WalletForbiddenError('You are not authorized to manage this wallet');
  }

  return wallet;
};

export const updateWallet = async (
  walletId: string,
  userId: string,
  updates: UpdateWalletRequest,
): Promise<Wallet> => {
  if (!updates || typeof updates !== 'object') {
    validationError('Request body is required');
  }

  const wallet = await getOwnedWallet(walletId, userId);

  if (Object.prototype.hasOwnProperty.call(updates, 'amountLimit')) {
    validateAmountLimit(updates.amountLimit);
    wallet.amountLimit = updates.amountLimit!;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'name')) {
    validateName(updates.name);
    wallet.name = updates.name!.trim();
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'description')) {
    if (updates.description !== null && typeof updates.description !== 'string') {
      validationError('description must be a string or null');
    }
    wallet.description = updates.description ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'color')) {
    validateColor(updates.color);
    wallet.color = updates.color!;
  }

  if (Object.keys(updates).length === 0) {
    validationError('At least one wallet field is required');
  }

  return walletRepo.save(wallet);
};

export const deleteWallet = async (walletId: string, userId: string): Promise<void> => {
  const wallet = await getOwnedWallet(walletId, userId);
  await walletRepo.remove(wallet);
};

export class ExpenseValidationError extends Error {}
export class ExpenseNotFoundError extends Error {}
export class ExpenseForbiddenError extends Error {}

const expenseValidationError = (message: string): never => {
  throw new ExpenseValidationError(message);
};

const validateExpenseAmount = (amount: unknown): number => {
  if (
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 9999999999.99 ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > Number.EPSILON
  ) {
    expenseValidationError(
      'amount must be greater than zero with at most two decimal places',
    );
  }

  return Math.round((amount as number) * 100);
};

const validateExpenseTitle = (title: unknown): string => {
  if (typeof title !== 'string' || title.trim().length === 0 || title.length > 150) {
    expenseValidationError('title is required and must be 150 characters or fewer');
  }
  return (title as string).trim();
};

const validateExpenseDescription = (description: unknown): string | null => {
  if (description !== undefined && description !== null && typeof description !== 'string') {
    expenseValidationError('description must be a string or null');
  }
  return description === undefined || description === null ? null : (description as string);
};

const validateExpenseId = (id: string): void => {
  if (!isUuid(id)) {
    expenseValidationError('Invalid expense id');
  }
};

const validateSharedBy = (
  sharedBy: unknown,
  expenseAmountCents: number,
): SharedExpenseRequest[] | undefined => {
  if (sharedBy === undefined) return undefined;
  if (!Array.isArray(sharedBy)) {
    expenseValidationError('sharedBy must be an array');
  }

  const seenUserIds = new Set<string>();
  let totalCents = 0;
  const allocations = sharedBy as SharedExpenseRequest[];

  for (const allocation of allocations) {
    if (!allocation || typeof allocation !== 'object') {
      expenseValidationError('Each shared expense allocation must be an object');
    }
    if (typeof allocation.userId !== 'string' || !isUuid(allocation.userId)) {
      expenseValidationError('Each shared expense allocation must have a valid userId');
    }
    if (seenUserIds.has(allocation.userId)) {
      expenseValidationError('Each user can only have one allocation per expense');
    }
    seenUserIds.add(allocation.userId);

    const allocationCents = validateExpenseAmount(allocation.amount);
    totalCents += allocationCents;

    if (
      allocation.note !== undefined &&
      allocation.note !== null &&
      typeof allocation.note !== 'string'
    ) {
      expenseValidationError('Shared expense note must be a string or null');
    }
    if (
      allocation.status !== undefined &&
      allocation.status !== SharedExpenseStatus.PENDING &&
      allocation.status !== SharedExpenseStatus.PAID
    ) {
      expenseValidationError('Shared expense status must be PENDING or PAID');
    }
  }

  if (allocations.length > 0 && totalCents !== expenseAmountCents) {
    expenseValidationError(
      'The total shared allocation must equal the expense amount',
    );
  }

  return allocations;
};

const getAccessibleWallet = async (
  manager: EntityManager,
  walletId: string,
  userId: string,
): Promise<Wallet> => {
  if (!isUuid(walletId)) {
    expenseValidationError('Invalid wallet id');
  }

  const wallet = await manager.findOne(Wallet, { where: { id: walletId } });
  if (!wallet) {
    throw new ExpenseNotFoundError('Wallet not found');
  }

  if (wallet.userId === userId) return wallet;
  if (!wallet.roomId) {
    throw new ExpenseForbiddenError('You are not authorized to access this wallet');
  }

  const member = await manager.findOne(RoomMember, {
    where: {
      roomId: wallet.roomId,
      userId,
      status: RoomMemberStatus.ACTIVE,
    },
  });
  if (!member) {
    throw new ExpenseForbiddenError('You are not authorized to access this wallet');
  }

  return wallet;
};

const validateSharedUsers = async (
  manager: EntityManager,
  allocations: SharedExpenseRequest[],
  wallet: Wallet,
): Promise<void> => {
  if (allocations.length === 0) return;

  const userIds = allocations.map((allocation) => allocation.userId);
  const users = await manager.find(User, { where: { id: In(userIds) }, select: ['id'] });
  if (users.length !== userIds.length) {
    expenseValidationError('One or more shared expense users do not exist');
  }

  if (wallet.roomId) {
    const members = await manager.find(RoomMember, {
      where: {
        roomId: wallet.roomId,
        userId: In(userIds),
        status: RoomMemberStatus.ACTIVE,
      },
      select: ['userId'],
    });
    if (members.length !== userIds.length) {
      expenseValidationError(
        'Shared expense users must be active members of the wallet room',
      );
    }
  }
};

const expenseWithShares = async (
  manager: EntityManager,
  expenseId: string,
): Promise<Expense> => {
  const expense = await manager.findOne(Expense, {
    where: { id: expenseId },
    relations: { sharedExpenses: true },
  });
  if (!expense) {
    throw new ExpenseNotFoundError('Expense not found');
  }
  return expense;
};

const getAccessibleExpense = async (
  manager: EntityManager,
  expenseId: string,
  userId: string,
): Promise<{ expense: Expense; wallet: Wallet }> => {
  validateExpenseId(expenseId);
  const expense = await expenseWithShares(manager, expenseId);
  const wallet = await getAccessibleWallet(manager, expense.walletId, userId);
  return { expense, wallet };
};

export const createExpense = async (
  userId: string,
  request: CreateExpenseRequest,
): Promise<Expense> =>
  AppDataSource.transaction(async (manager) => {
    if (!request || typeof request !== 'object') {
      expenseValidationError('Request body is required');
    }

    const wallet = await getAccessibleWallet(manager, request.walletId, userId);
    const amountCents = validateExpenseAmount(request.amount);
    const title = validateExpenseTitle(request.title);
    const description = validateExpenseDescription(request.description);
    const allocations = validateSharedBy(request.sharedBy, amountCents);

    if (allocations) {
      await validateSharedUsers(manager, allocations, wallet);
    }

    const expense = manager.create(Expense, {
      walletId: wallet.id,
      userId,
      amount: amountCents / 100,
      title,
      description,
    });
    const savedExpense = await manager.save(Expense, expense);

    if (allocations && allocations.length > 0) {
      const sharedExpenses = allocations.map((allocation) =>
        manager.create(SharedExpense, {
          expensesId: savedExpense.id,
          userId: allocation.userId,
          amount: validateExpenseAmount(allocation.amount) / 100,
          note: allocation.note ?? null,
          status: (allocation.status as SharedExpenseStatus | undefined)
            ?? SharedExpenseStatus.PENDING,
        }),
      );
      await manager.save(SharedExpense, sharedExpenses);
    }

    return expenseWithShares(manager, savedExpense.id);
  });

export const getExpensesByWallet = async (
  walletId: string,
  userId: string,
): Promise<Expense[]> =>
  AppDataSource.transaction(async (manager) => {
    const wallet = await getAccessibleWallet(manager, walletId, userId);
    return manager.find(Expense, {
      where: { walletId: wallet.id },
      relations: { sharedExpenses: true },
      order: { createdOn: 'DESC' },
    });
  });

export const getExpenseById = async (
  expenseId: string,
  userId: string,
): Promise<Expense> =>
  AppDataSource.transaction(async (manager) => {
    const result = await getAccessibleExpense(manager, expenseId, userId);
    return result.expense;
  });

export const updateExpense = async (
  expenseId: string,
  userId: string,
  request: UpdateExpenseRequest,
): Promise<Expense> =>
  AppDataSource.transaction(async (manager) => {
    if (!request || typeof request !== 'object') {
      expenseValidationError('Request body is required');
    }

    const { expense, wallet } = await getAccessibleExpense(manager, expenseId, userId);
    if (Object.keys(request).length === 0) {
      expenseValidationError('At least one expense field is required');
    }

    const hasAmount = Object.prototype.hasOwnProperty.call(request, 'amount');
    const hasSharedBy = Object.prototype.hasOwnProperty.call(request, 'sharedBy');
    const amountCents = hasAmount
      ? validateExpenseAmount(request.amount)
      : Math.round(expense.amount * 100);

    if (hasAmount) expense.amount = amountCents / 100;
    if (Object.prototype.hasOwnProperty.call(request, 'title')) {
      expense.title = validateExpenseTitle(request.title);
    }
    if (Object.prototype.hasOwnProperty.call(request, 'description')) {
      expense.description = validateExpenseDescription(request.description);
    }

    const allocations = validateSharedBy(request.sharedBy, amountCents);
    if (hasAmount && !hasSharedBy && expense.sharedExpenses.length > 0) {
      expenseValidationError(
        'sharedBy is required when changing an expense with shared allocations',
      );
    }
    if (allocations) {
      await validateSharedUsers(manager, allocations, wallet);
    }

    await manager.save(Expense, expense);
    if (hasSharedBy) {
      await manager.delete(SharedExpense, { expensesId: expense.id });
      if (allocations && allocations.length > 0) {
        await manager.save(
          SharedExpense,
          allocations.map((allocation) =>
            manager.create(SharedExpense, {
              expensesId: expense.id,
              userId: allocation.userId,
              amount: validateExpenseAmount(allocation.amount) / 100,
              note: allocation.note ?? null,
              status: (allocation.status as SharedExpenseStatus | undefined)
                ?? SharedExpenseStatus.PENDING,
            }),
          ),
        );
      }
    }

    return expenseWithShares(manager, expense.id);
  });

export const deleteExpense = async (
  expenseId: string,
  userId: string,
): Promise<void> =>
  AppDataSource.transaction(async (manager) => {
    const { expense } = await getAccessibleExpense(manager, expenseId, userId);
    await manager.remove(Expense, expense);
  });