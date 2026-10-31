import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { createWallet } from '@/services/expensesService';
import { showError, showSuccess } from '@/services/toast.service';
import { CreateWalletPayload } from '@/types/expensesTypes';
import { walletsQueryKey } from './useGetWallets';

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export const useCreateWallet = () => {
  const params = useLocalSearchParams<{ roomId?: string | string[] }>();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amountLimit, setAmountLimit] = useState('');
  const [color, setColor] = useState('#4CAF50');
  const [roomId, setRoomId] = useState(firstParam(params.roomId) ?? '');

  useEffect(() => {
    setRoomId(firstParam(params.roomId) ?? '');
  }, [params.roomId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const normalizedName = name.trim();
      const normalizedAmount = amountLimit.trim();
      const parsedLimit = normalizedAmount ? Number(normalizedAmount) : 0;

      if (!normalizedName || normalizedName.length > 100) {
        throw new Error('Wallet name must be between 1 and 100 characters');
      }
      if (!Number.isFinite(parsedLimit) || parsedLimit < 0 || Math.round(parsedLimit * 100) !== parsedLimit * 100) {
        throw new Error('Amount limit must be a non-negative number with at most two decimals');
      }
      if (!/^#[0-9a-f]{6}$/i.test(color.trim())) {
        throw new Error('Color must be a valid hex color such as #4CAF50');
      }
      if (roomId.trim() && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(roomId.trim())) {
        throw new Error('Room ID must be a valid UUID');
      }

      const payload: CreateWalletPayload = {
        name: normalizedName,
        amountLimit: parsedLimit,
        description: description.trim() || null,
        color: color.trim(),
        ...(roomId.trim() ? { roomId: roomId.trim() } : {}),
      };
      const response = await createWallet(payload);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create wallet');
      }
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: walletsQueryKey });
      showSuccess('Success', response.message || 'Wallet created successfully');
      router.back();
    },
    onError: (error: Error) => showError('Create Error', error.message),
  });

  return {
    name,
    setName,
    description,
    setDescription,
    amountLimit,
    setAmountLimit,
    color,
    setColor,
    roomId,
    setRoomId,
    create: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
};