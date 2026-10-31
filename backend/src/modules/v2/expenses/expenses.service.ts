import { AppDataSource } from '../../../infrastructure/postgres/postgres';
import { RoomMember, RoomMemberStatus } from '../room/room-member.entity';
import { Wallet } from './wallet.entity';
import { CreateWalletRequest, UpdateWalletRequest } from './expenses.types';

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