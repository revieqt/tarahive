import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { updateExpense } from '@/services/expensesService';
import { showError } from '@/services/toast.service';
import { SharedExpensePayload, UpdateExpensePayload } from '@/types/expensesTypes';
import { expenseQueryKey, useGetExpense } from './useGetExpense';
import { expensesByWalletQueryKey } from './useGetExpenses';
import { useGetWallets } from './useGetWallets';

export const useUpdateExpense = (onSuccess?: () => void) => {
  const { id, roomId: roomIdParam } = useLocalSearchParams<{
    id?: string | string[];
    roomId?: string | string[];
  }>();
  const expenseId = Array.isArray(id) ? id[0] : id;
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
  const queryClient = useQueryClient();
  const expenseQuery = useGetExpense(expenseId);
  const expense = expenseQuery.expense;
  const walletsQuery = useGetWallets(roomId);
  const walletColor = walletsQuery.wallets.find(
    (wallet) => wallet.id === expense?.walletId,
  )?.color;
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sharedBy, setSharedBy] = useState<SharedExpensePayload[]>([]);

  useEffect(() => {
    if (!expense) return;
    setAmount(String(expense.amount));
    setTitle(expense.title);
    setDescription(expense.description ?? '');
    setSharedBy(expense.sharedExpenses.map((share) => ({
      userId: share.userId,
      amount: share.amount,
      note: share.note,
      status: share.status,
    })));
  }, [expense?.id]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!expenseId || !expense) throw new Error('Expense ID is missing');
      const parsedAmount = Number(amount.trim());
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || Math.round(parsedAmount * 100) !== parsedAmount * 100) {
        throw new Error('Amount must be greater than zero with at most two decimals');
      }
      if (!title.trim() || title.trim().length > 150) {
        throw new Error('Title must be between 1 and 150 characters');
      }
      const payload: UpdateExpensePayload = {};
      if (parsedAmount !== expense.amount) payload.amount = parsedAmount;
      if (title.trim() !== expense.title) payload.title = title.trim();
      const nextDescription = description.trim() || null;
      if (nextDescription !== expense.description) payload.description = nextDescription;

      const originalShares = expense.sharedExpenses.map((share) => ({
        userId: share.userId,
        amount: share.amount,
        note: share.note,
        status: share.status,
      }));
      const sharesChanged = JSON.stringify(sharedBy) !== JSON.stringify(originalShares);
      if (!roomId && (sharesChanged || (payload.amount !== undefined && originalShares.length > 0))) {
        payload.sharedBy = sharedBy;
      }
      if (Object.keys(payload).length === 0) {
        throw new Error('No expense changes to save');
      }

      const response = await updateExpense(expenseId, payload);
      if (!response.success || !response.data && !response.expense) {
        throw new Error(response.message || 'Failed to update expense');
      }
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKey(expenseId) });
      if (expense) {
        queryClient.invalidateQueries({ queryKey: expensesByWalletQueryKey(expense.walletId) });
      }
      onSuccess?.();
    },
    onError: (error: Error) => showError('Update Error', error.message),
  });

  const addShare = () =>
    setSharedBy((current) => [...current, { userId: '', amount: 0, note: '', status: 'PENDING' }]);
  const updateShare = (index: number, patch: Partial<SharedExpensePayload>) =>
    setSharedBy((current) => current.map((share, i) => i === index ? { ...share, ...patch } : share));
  const removeShare = (index: number) =>
    setSharedBy((current) => current.filter((_, i) => i !== index));

  return {
    expense,     isLoading: expenseQuery.isLoading, amount, setAmount, title, setTitle,
    description, setDescription, roomId, showSharedExpenses: !roomId,
    walletColor,
    sharedBy, addShare, updateShare, removeShare,
    save: () => mutation.mutate(), isPending: mutation.isPending,
  };
};
