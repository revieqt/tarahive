import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TIcon, TText } from '@/components/ui/Themed';
import TextField from '@/components/ui/TextField';
import type { SharedExpensePayload, SharedExpenseStatus } from '@/types/expensesTypes';

interface ExpenseFormFieldsProps {
  amount: string;
  setAmount: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  sharedBy: SharedExpensePayload[];
  addShare: () => void;
  updateShare: (index: number, patch: Partial<SharedExpensePayload>) => void;
  removeShare: (index: number) => void;
  showSharedExpenses?: boolean;
}

export default function ExpenseFormFields({
  amount,
  setAmount,
  title,
  setTitle,
  description,
  setDescription,
  sharedBy,
  addShare,
  updateShare,
  removeShare,
  showSharedExpenses = true,
}: ExpenseFormFieldsProps) {
  return (
    <>
      <TextField value={title} onChangeText={setTitle} placeholder="Title" autoCapitalize="sentences" maxLength={150} />
      <TextField value={amount} onChangeText={setAmount} placeholder="Amount" keyboardType="numeric" />
      <TextField value={description} onChangeText={setDescription} placeholder="Description (optional)" multiline numberOfLines={3} />

      {showSharedExpenses && <View style={styles.shareHeader}>
        <TText type="subtitle">Shared expense allocations</TText>
        <TouchableOpacity onPress={addShare} accessibilityRole="button">
          <TIcon name="plus-circle" size={28} />
        </TouchableOpacity>
      </View>}
      {showSharedExpenses && sharedBy.map((share, index) => (
        <View key={`${index}-${share.userId}`} style={styles.share}>
          <TextField
            value={share.userId}
            onChangeText={(value) => updateShare(index, { userId: value })}
            placeholder="Participant user ID"
          />
          <TextField
            value={share.amount ? String(share.amount) : ''}
            onChangeText={(value) => updateShare(index, { amount: Number(value) || 0 })}
            placeholder="Allocated amount"
            keyboardType="numeric"
          />
          <TextField
            value={share.note ?? ''}
            onChangeText={(value) => updateShare(index, { note: value })}
            placeholder="Note (optional)"
          />
          <View style={styles.shareActions}>
            <TouchableOpacity
              style={[styles.status, share.status === 'PENDING' && styles.activeStatus]}
              onPress={() => updateShare(index, { status: 'PENDING' as SharedExpenseStatus })}
            >
              <TText>PENDING</TText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.status, share.status === 'PAID' && styles.activeStatus]}
              onPress={() => updateShare(index, { status: 'PAID' as SharedExpenseStatus })}
            >
              <TText>PAID</TText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeShare(index)}>
              <TIcon name="delete" size={22} color="#DC143C" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  share: {
    borderWidth: 1,
    borderColor: '#ccc5',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
  },
  shareActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    borderWidth: 1,
    borderColor: '#ccc6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  activeStatus: {
    backgroundColor: '#4CAF5040',
    borderColor: '#4CAF50',
  },
});
