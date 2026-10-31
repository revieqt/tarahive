import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/common/Header';
import RoundButton from '@/components/ui/RoundButton';
import TextField from '@/components/ui/TextField';
import { TView } from '@/components/ui/Themed';
import { useCreateWallet } from '@/hooks/expenses/useCreateWallet';

export default function CreateWalletScreen() {
  const { roomId: roomIdParam } = useLocalSearchParams<{ roomId?: string | string[] }>();
  const roomScoped = Boolean(roomIdParam);
  const {
    name, setName, description, setDescription, amountLimit, setAmountLimit,
    color, setColor, roomId, setRoomId, create, isPending,
  } = useCreateWallet();

  return (
    <TView style={styles.container}>
      <Header title="Create Wallet" />
      <TextField value={name} onChangeText={setName} placeholder="Wallet name" autoCapitalize="words" maxLength={100} />
      <TextField value={description} onChangeText={setDescription} placeholder="Description (optional)" multiline numberOfLines={3} />
      <TextField value={amountLimit} onChangeText={setAmountLimit} placeholder="Amount limit (0 = unlimited)" keyboardType="numeric" />
      <TextField value={color} onChangeText={setColor} placeholder="Color (#4CAF50)" autoCapitalize="characters" />
      {!roomScoped && (
        <TextField value={roomId} onChangeText={setRoomId} placeholder="Room ID (optional)" />
      )}
      <RoundButton iconName="plus" onPress={create} loading={isPending} style={styles.button} />
    </TView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: '3%' },
  button: { position: 'absolute', bottom: '3%', right: 16 },
});