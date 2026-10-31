import { ActivityIndicator, StyleSheet } from 'react-native';
import Header from '@/components/common/Header';
import RoundButton from '@/components/ui/RoundButton';
import TextField from '@/components/ui/TextField';
import { TView } from '@/components/ui/Themed';
import { useUpdateWallet } from '@/hooks/expenses/useUpdateWallet';

export default function UpdateWalletScreen() {
  const {
    isLoading, name, setName, description, setDescription, amountLimit, setAmountLimit,
    color, setColor, save, isPending,
  } = useUpdateWallet();

  if (isLoading) {
    return <TView style={styles.loading}><ActivityIndicator /></TView>;
  }

  return (
    <TView style={styles.container}>
      <Header title="Update Wallet" />
      <TextField value={name} onChangeText={setName} placeholder="Wallet name" autoCapitalize="words" maxLength={100} />
      <TextField value={description} onChangeText={setDescription} placeholder="Description (optional)" multiline numberOfLines={3} />
      <TextField value={amountLimit} onChangeText={setAmountLimit} placeholder="Amount limit (0 = unlimited)" keyboardType="numeric" />
      <TextField value={color} onChangeText={setColor} placeholder="Color (#4CAF50)" autoCapitalize="characters" />
      <RoundButton iconName="check" onPress={save} loading={isPending} style={styles.button} />
    </TView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: '3%' },
  button: { position: 'absolute', bottom: '3%', right: 16 },
});