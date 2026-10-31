import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import Header from '@/components/common/Header';
import RoundButton from '@/components/ui/RoundButton';
import { TText, TView } from '@/components/ui/Themed';
import ExpenseFormFields from '@/components/expenses/ExpenseFormFields';
import { useCreateExpense } from '@/hooks/expenses/useCreateExpense';
import { useGetWallets } from '@/hooks/expenses/useGetWallets';
import WalletSuccessModal from '@/components/expenses/WalletSuccessModal';

export default function CreateExpenseScreen() {
  const [successVisible, setSuccessVisible] = useState(false);
  const form = useCreateExpense(() => setSuccessVisible(true));
  const { wallets, isLoading } = useGetWallets(form.roomId);
  const selectedWallet = wallets.find((wallet) => wallet.id === form.walletId);

  return (
    <TView style={styles.container}>
      <Header title="Create Expense" />
      <ScrollView contentContainerStyle={styles.content}>
        <TText type="subtitle">Wallet</TText>
        {isLoading ? <ActivityIndicator /> : (
          <View style={styles.wallets}>
            {wallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={[styles.walletOption, form.walletId === wallet.id && { borderColor: wallet.color, backgroundColor: `${wallet.color}22` }]}
                onPress={() => form.setWalletId(wallet.id)}
              >
                <TText>{wallet.name}</TText>
                {wallet.roomId && <TText style={styles.roomLabel}>Room wallet</TText>}
              </TouchableOpacity>
            ))}
          </View>
        )}
        <ExpenseFormFields {...form} showSharedExpenses={form.showSharedExpenses} />
      </ScrollView>
      <RoundButton iconName="plus" onPress={form.create} loading={form.isPending} style={styles.button} />
      <WalletSuccessModal
        visible={successVisible}
        onFinish={() => router.back()}
        title="Expense Created"
        subtitle={`${form.title} is ready to track`}
        walletColor={selectedWallet?.color}
      />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: '3%' },
  content: { paddingBottom: 100 },
  wallets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  walletOption: { borderWidth: 1, borderColor: '#ccc6', borderRadius: 14, padding: 10 },
  roomLabel: { fontSize: 10, opacity: 0.6 },
  button: { position: 'absolute', bottom: '3%', right: 16 },
});
