import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import Header from '@/components/common/Header';
import RoundButton from '@/components/ui/RoundButton';
import { TView } from '@/components/ui/Themed';
import ExpenseFormFields from '@/components/expenses/ExpenseFormFields';
import { useUpdateExpense } from '@/hooks/expenses/useUpdateExpense';

export default function UpdateExpenseScreen() {
  const form = useUpdateExpense();

  if (form.isLoading) {
    return <TView style={styles.loading}><ActivityIndicator /></TView>;
  }

  return (
    <TView style={styles.container}>
      <Header title="Update Expense" />
      <ScrollView contentContainerStyle={styles.content}>
        <ExpenseFormFields {...form} showSharedExpenses={form.showSharedExpenses} />
      </ScrollView>
      <RoundButton iconName="check" onPress={form.save} loading={form.isPending} style={styles.button} />
    </TView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: '3%' },
  content: { paddingBottom: 100 },
  button: { position: 'absolute', bottom: '3%', right: 16 },
});
