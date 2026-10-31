import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { updateWallet } from '@/services/expensesService';
import { showError } from '@/services/toast.service';
import { UpdateWalletPayload, Wallet } from '@/types/expensesTypes';
import { useGetWallets, walletsQueryKey } from './useGetWallets';

export const useUpdateWallet = (onSuccess?: () => void) => {
  const { id, roomId: roomIdParam } = useLocalSearchParams<{
    id?: string | string[];
    roomId?: string | string[];
  }>();
  const walletId = Array.isArray(id) ? id[0] : id;
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
  const queryClient = useQueryClient();
  const walletsQuery = useGetWallets(roomId);
  const wallet = walletsQuery.wallets.find((item: Wallet) => item.id === walletId);
  const [name, setName] = useState(wallet?.name ?? '');
  const [description, setDescription] = useState(wallet?.description ?? '');
  const [amountLimit, setAmountLimit] = useState(wallet?.amountLimit ? String(wallet.amountLimit) : '');
  const [color, setColor] = useState(wallet?.color ?? '#4CAF50');

  useEffect(() => {
    if (!wallet) return;
    setName(wallet.name);
    setDescription(wallet.description ?? '');
    setAmountLimit(wallet.amountLimit ? String(wallet.amountLimit) : '');
    setColor(wallet.color);
  }, [wallet?.id]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!walletId) throw new Error('Wallet ID is missing');
      const normalizedName = name.trim();
      const normalizedColor = color.trim();
      const parsedLimit = amountLimit.trim() ? Number(amountLimit.trim()) : 0;

      if (!normalizedName || normalizedName.length > 100) {
        throw new Error('Wallet name must be between 1 and 100 characters');
      }
      if (!Number.isFinite(parsedLimit) || parsedLimit < 0 || Math.round(parsedLimit * 100) !== parsedLimit * 100) {
        throw new Error('Amount limit must be a non-negative number with at most two decimals');
      }
      if (!/^#[0-9a-f]{6}$/i.test(normalizedColor)) {
        throw new Error('Color must be a valid hex color such as #4CAF50');
      }

      const payload: UpdateWalletPayload = {
        name: normalizedName,
        description: description.trim() || null,
        amountLimit: parsedLimit,
        color: normalizedColor,
      };
      const response = await updateWallet(walletId, payload);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update wallet');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsQueryKey });
      onSuccess?.();
    },
    onError: (error: Error) => showError('Update Error', error.message),
  });

  return {
    wallet,
    isLoading: walletsQuery.isLoading || (!wallet && Boolean(walletId)),
    name,
    setName,
    description,
    setDescription,
    amountLimit,
    setAmountLimit,
    color,
    setColor,
    save: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
};