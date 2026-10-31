import { StyleSheet, View } from 'react-native';
import ColorBar from '@/components/itinerary/ColorBar';
import RoundButton from '@/components/ui/RoundButton';
import TextField from '@/components/ui/TextField';
import { TView } from '@/components/ui/Themed';

interface WalletFormProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  amountLimit: string;
  setAmountLimit: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  roomId?: string;
  setRoomId?: (value: string) => void;
  submit: () => void;
  submitIcon: 'check' | 'plus';
  isPending: boolean;
}

export default function WalletForm({
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
  submit,
  submitIcon,
  isPending,
}: WalletFormProps) {
  return (
    <TView style={styles.form}>
      <TextField value={name} onChangeText={setName} placeholder="Wallet name" autoCapitalize="words" maxLength={100} />
      <TextField value={description} onChangeText={setDescription} placeholder="Description (optional)" multiline numberOfLines={3} />
      <TextField value={amountLimit} onChangeText={setAmountLimit} placeholder="Amount limit (0 = unlimited)" keyboardType="numeric" />
      <View style={styles.colorBarContainer}>
        <ColorBar primaryColor="transparent" selectedColor={color} onSelect={setColor} />
      </View>
      {setRoomId && (
        <TextField value={roomId ?? ''} onChangeText={setRoomId} placeholder="Room ID (optional)" />
      )}
      <RoundButton iconName={submitIcon} onPress={submit} loading={isPending} style={styles.button} />
    </TView>
  );
}

const styles = StyleSheet.create({
  form: { flex: 1 },
  colorBarContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc4',
    borderRadius: 30,
    marginBottom: 8,
  },
  button: { position: 'absolute', bottom: '3%', right: 16 },
});
