import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/common/Header';
import { TIcon, TText, TView } from '@/components/ui/Themed';
import { useGetExpense } from '@/hooks/expenses/useGetExpense';
import { useDeleteExpense } from '@/hooks/expenses/useDeleteExpense';
import { Dialog } from '@/services/dialog.service';

export default function ExpenseDetailsScreen() {
  const { id, roomId: roomIdParam } = useLocalSearchParams<{
    id?: string | string[];
    roomId?: string | string[];
  }>();
  const expenseId = Array.isArray(id) ? id[0] : id;
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
  const { expense, isLoading } = useGetExpense(expenseId);
  const { deleteExpense, isPending: isDeleting } = useDeleteExpense(expense?.walletId);

  if (isLoading) return <TView style={styles.loading}><ActivityIndicator /></TView>;
  if (!expense) return <TView style={styles.loading}><TText>Expense not found.</TText></TView>;

  const confirmDelete = () => Dialog.confirm(
    'Delete expense?',
    `Delete "${expense.title}"?`,
    {
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () => {
        deleteExpense(expense.id);
        router.back();
      },
    },
  );

  return (
    <TView style={styles.container}>
      <Header title="Expense" />
      <View style={styles.card}>
        <View style={styles.topRow}>
          <TText type="title">{expense.title}</TText>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => router.push({
              pathname: '/expenses/update',
              params: { id: expense.id, ...(roomId ? { roomId } : {}) },
            })}>
              <TIcon name="pencil" size={22} />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} disabled={isDeleting}>
              <TIcon name="delete" size={22} color="#DC143C" />
            </TouchableOpacity>
          </View>
        </View>
        <TText style={styles.amount}>{expense.amount.toFixed(2)}</TText>
        {expense.description && <TText style={styles.description}>{expense.description}</TText>}
        <TText style={styles.date}>{new Date(expense.createdOn).toLocaleString()}</TText>
      </View>

      <View style={styles.shareSection}>
        <TText type="subtitle">Shared allocations</TText>
        {expense.sharedExpenses.length === 0 ? (
          <TText style={styles.muted}>Personal expense</TText>
        ) : expense.sharedExpenses.map((share) => (
          <View key={share.id} style={styles.shareRow}>
            <View>
              <TText>{share.userId}</TText>
              {share.note && <TText style={styles.muted}>{share.note}</TText>}
            </View>
            <TText>{share.amount.toFixed(2)} · {share.status}</TText>
          </View>
        ))}
      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: '3%' },
  card: { padding: 16, borderRadius: 16, backgroundColor: '#ccc2' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  actions: { flexDirection: 'row', gap: 14 },
  amount: { fontSize: 28, fontWeight: '700', marginTop: 20 },
  description: { marginTop: 12 },
  date: { marginTop: 12, opacity: 0.6, fontSize: 11 },
  shareSection: { marginTop: 24, gap: 10 },
  shareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc3' },
  muted: { opacity: 0.6, fontSize: 11 },
});
