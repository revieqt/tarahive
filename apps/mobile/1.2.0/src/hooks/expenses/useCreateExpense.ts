import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { createExpense } from '@/services/expensesService';
import { showError } from '@/services/toast.service';
import {
  CreateExpensePayload,
  SharedExpensePayload,
  SharedExpenseStatus,
} from '@/types/expensesTypes';
import { expensesByWalletQueryKey } from './useGetExpenses';

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const useCreateExpense = (onSuccess?: () => void) => {
  const params = useLocalSearchParams<{ walletId?: string | string[]; roomId?: string | string[] }>();
  const queryClient = useQueryClient();
  const [walletId, setWalletId] = useState(firstParam(params.walletId) ?? '');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sharedBy, setSharedBy] = useState<SharedExpensePayload[]>([]);
  const roomId = firstParam(params.roomId);

  const mutation = useMutation({
    mutationFn: async () => {
      const parsedAmount = Number(amount.trim());
      const normalizedTitle = title.trim();
      if (!uuidPattern.test(walletId.trim())) throw new Error('A valid wallet is required');
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || Math.round(parsedAmount * 100) !== parsedAmount * 100) {
        throw new Error('Amount must be greater than zero with at most two decimals');
      }
      if (!normalizedTitle || normalizedTitle.length > 150) {
        throw new Error('Title must be between 1 and 150 characters');
      }
      const payload: CreateExpensePayload = {
        walletId: walletId.trim(),
        amount: parsedAmount,
        title: normalizedTitle,
        description: description.trim() || null,
        ...(!roomId && sharedBy.length ? { sharedBy } : {}),
      };
      const response = await createExpense(payload);
      if (!response.success || !response.data && !response.expense) {
        throw new Error(response.message || 'Failed to create expense');
      }
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: expensesByWalletQueryKey(walletId) });
      onSuccess?.();
    },
    onError: (error: Error) => showError('Create Error', error.message),
  });

  const addShare = () =>
    setSharedBy((current) => [...current, { userId: '', amount: 0, note: '', status: 'PENDING' }]);
  const updateShare = (index: number, patch: Partial<SharedExpensePayload>) =>
    setSharedBy((current) => current.map((share, i) => i === index ? { ...share, ...patch } : share));
  const removeShare = (index: number) =>
    setSharedBy((current) => current.filter((_, i) => i !== index));

  return {
    walletId, setWalletId, amount, setAmount, title, setTitle, description, setDescription,
    roomId,
    showSharedExpenses: !roomId,
    sharedBy, addShare, updateShare, removeShare, create: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
};
